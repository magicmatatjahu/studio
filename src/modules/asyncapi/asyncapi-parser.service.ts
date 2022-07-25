import { Inject, Injectable, SingletonScope } from "@adi/core";

import { AsyncAPIService } from "./asyncapi.service";
import { ProblemsManager, ProblemSeverity } from "../terminal/services/problems-manager.service";

import { debounce } from '../../helpers';

import { MarkerSeverity, Range } from 'monaco-editor/esm/vs/editor/editor.api';

import type { OnInit } from '@adi/core';
import type { ProblemRecord } from "../terminal/services/problems-manager.service";
import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';

@Injectable({
  scope: SingletonScope,
})
export class AsyncAPIParserService implements OnInit {
  constructor(
    private readonly asyncAPIService: AsyncAPIService,
    private readonly problemsManager: ProblemsManager,
    @Inject('studio:monaco') private readonly monaco: typeof monacoAPI,
  ) {}
  
  onInit() {
    this.monaco.editor.onDidCreateModel(this.onDidCreateModel.bind(this));
  }

  private onDidCreateModel(model: monacoAPI.editor.ITextModel) {
    this.parse(model);
    model.onDidChangeContent(debounce(() => this.parse(model), 750));
  }

  private async parse(model: monacoAPI.editor.ITextModel) {
    try {
      await this.asyncAPIService.parse(model.getValue());
      this.removeErrorsFromModel(model);
    } catch(errors) {
      const parsedErrors = this.filterErrors(errors);

      if (!parsedErrors.length) {
        this.removeErrorsFromModel(model);
        return;
      }
      this.applyErrorsToModel(parsedErrors, model);
    }
  }

  private applyErrorsToModel(errors: any[] = [], model: monacoAPI.editor.ITextModel) {
    const problems = this.createProblems(errors, model);
    const markers = this.createMarkers(errors, model);
    const decorations = this.createDecorations(errors, model);
    const oldDecorations = model.getAllDecorations().map(d => d.id);
    
    this.problemsManager.add({ owner: model.uri.toString(), resource: model.uri, problems });
    model.deltaDecorations(oldDecorations, decorations);
    this.monaco.editor.setModelMarkers(model, '', markers); // apply for editors
  }

  private removeErrorsFromModel(model: monacoAPI.editor.ITextModel) {
    const oldDecorations = model.getAllDecorations().map(d => d.id);
    
    this.problemsManager.remove(model.uri.toString());
    model.deltaDecorations(oldDecorations, []);
    this.monaco.editor.setModelMarkers(model, '', []); // apply for editors
  }

  private createProblems(errors: any[] = [], model: monacoAPI.editor.ITextModel) {
    return errors.map(err => {
      const { title, detail } = err;
      let location = err.location;

      if (!location || location.jsonPointer === '/') {
        const fullRange = model.getFullModelRange();
        // reset location
        location = {};
        location.startLine = fullRange.startLineNumber;
        location.startColumn = fullRange.startColumn;
        location.endLine = fullRange.endLineNumber;
        location.endColumn = fullRange.endColumn;
      }
      const { startLine, startColumn, endLine, endColumn } = location;
      const detailContent = detail ? `\n\n${detail}` : '';

      return {
        severity: ProblemSeverity.Error,
        message: `${title}${detailContent}`,
        range: {
          startLine: startLine,
          startColumn,
          endLine: typeof endLine === 'number' ? endLine : startLine,
          endColumn: typeof endColumn === 'number' ? endColumn : startColumn,
        }
      } as ProblemRecord;
    });
  }

  private createMarkers(errors: any[] = [], model: monacoAPI.editor.ITextModel) {
    return errors.map(err => {
      const { title, detail } = err;
      let location = err.location;

      if (!location || location.jsonPointer === '/') {
        const fullRange = model.getFullModelRange();
        // reset location
        location = {};
        location.startLine = fullRange.startLineNumber;
        location.startColumn = fullRange.startColumn;
        location.endLine = fullRange.endLineNumber;
        location.endColumn = fullRange.endColumn;
      }
      const { startLine, startColumn, endLine, endColumn } = location;
      const detailContent = detail ? `\n\n${detail}` : '';

      return {
        startLineNumber: startLine,
        startColumn,
        endLineNumber: typeof endLine === 'number' ? endLine : startLine,
        endColumn: typeof endColumn === 'number' ? endColumn : startColumn,
        severity: MarkerSeverity.Error,
        message: `${title}${detailContent}`,
      } as monacoAPI.editor.IMarkerData;
    });
  }

  private createDecorations(errors: any[] = [], model: monacoAPI.editor.ITextModel) {
    return errors.map(err => {
      let location = err.location;

      if (!location || location.jsonPointer === '/') {
        const fullRange = model.getFullModelRange();
        // reset location
        location = {};
        location.startLine = fullRange.startLineNumber;
        location.startColumn = fullRange.startColumn;
        location.endLine = fullRange.endLineNumber;
        location.endColumn = fullRange.endColumn;
      }
      const { startLine, startColumn, endLine, endColumn } = location;

      return {
        range: new Range(
          startLine, 
          startColumn, 
          typeof endLine === 'number' ? endLine : startLine, 
          typeof endColumn === 'number' ? endColumn : startColumn
        ),
        options: { inlineClassName: 'bg-red-500-20' },
      } as monacoAPI.editor.IModelDecoration;
    });
  }

  private filterErrors(err: any) {
    const errors = [];
    if (this.isUnsupportedVersionError(err)) {
      errors.push({
        type: err.type,
        title: err.message,
        location: err.validationErrors,
      });
    }
    if (this.isValidationError(err)) {
      errors.push(...err.validationErrors);
    }
    if (this.isYamlError(err) || this.isJsonError(err)) {
      errors.push(err);
    }
    if (this.isDereferenceError(err)) {
      errors.push(
        ...err.refs.map((ref: any) => ({
          type: err.type,
          title: err.title,
          location: { ...ref },
        })),
      );
    }
    if (errors.length === 0) {
      errors.push(err);
    }
    return errors;
  }

  private isValidationError(err?: { type: string }) {
    return (
      err &&
      err.type === 'https://github.com/asyncapi/parser-js/validation-errors'
    );
  }

  private isJsonError(err?: { type: string }) {
    return (
      err && err.type === 'https://github.com/asyncapi/parser-js/invalid-json'
    );
  }

  private isYamlError(err?: { type: string }) {
    return (
      err && err.type === 'https://github.com/asyncapi/parser-js/invalid-yaml'
    );
  }

  private isUnsupportedVersionError(err?: { type: string }) {
    return (
      err &&
      err.type === 'https://github.com/asyncapi/parser-js/unsupported-version'
    );
  }

  private isDereferenceError(err?: { type: string }) {
    return (
      err &&
      err.type === 'https://github.com/asyncapi/parser-js/dereference-error'
    );
  }
}
