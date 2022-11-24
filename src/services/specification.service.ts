import { AbstractService } from './abstract.service';

import specs from '@asyncapi/specs';
import { convert } from '@asyncapi/converter';
import { Parser, convertToOldAPI, DiagnosticSeverity } from '@asyncapi/parser/cjs';
import { untilde } from '@asyncapi/parser/cjs/utils';
import { OpenAPISchemaParser } from '@asyncapi/parser/cjs/schema-parser/openapi-schema-parser';
import { AvroSchemaParser } from '@asyncapi/parser/cjs/schema-parser/avro-schema-parser';
import YAML from 'js-yaml';

import state from '../state';

import type { ConvertVersion } from '@asyncapi/converter';
import type { OldAsyncAPIDocument as AsyncAPIDocument, Diagnostic } from '@asyncapi/parser/cjs';
import type { SpecVersions } from '../types';

const parser = new Parser({
  __unstable: {
    resolver: {
      cache: false,
    }
  }
});
parser.registerSchemaParser(OpenAPISchemaParser());
parser.registerSchemaParser(AvroSchemaParser());

export class SpecificationService extends AbstractService {
  getParsedSpec() {
    return window.ParsedSpec || null;
  }

  getParsedExtras() {
    return window.ParsedExtras || null;
  }

  async parseSpec(rawSpec: string): Promise<AsyncAPIDocument | void> {
    let diagnostics: Diagnostic[] = [];

    try {
      const { document, diagnostics: validationDiagnostics, extras } = await parser.parse(rawSpec);
      diagnostics = validationDiagnostics;
  
      if (document) {
        const oldDocument = convertToOldAPI(document);
        window.ParsedSpec = oldDocument;
        window.ParsedExtras = extras;
        state.parser.set({
          parsedSpec: oldDocument,
          valid: true,
          diagnostics,
          hasErrorDiagnostics: false,
        });
  
        const version = oldDocument.version() as SpecVersions;
        this.svcs.monacoSvc.updateLanguageConfig(version);
        if (this.shouldInformAboutLatestVersion(version)) {
          state.spec.set({
            shouldOpenConvertModal: true,
            convertOnlyToLatest: false,
            forceConvert: false,
          });
        }
  
        this.svcs.editorSvc.applyMarkers(diagnostics);
        return oldDocument;
      } 
    } catch (err: unknown) {
      console.log(err);
      diagnostics = [];
    }

    window.ParsedSpec = undefined;
    window.ParsedExtras = undefined;
    try {
      const version = (YAML.load(rawSpec) as { asyncapi: SpecVersions }).asyncapi;
      this.svcs.monacoSvc.updateLanguageConfig(version);
    } catch (e: any) {
      // intentional
    }

    state.parser.set({
      parsedSpec: null,
      valid: false,
      diagnostics,
      hasErrorDiagnostics: true,
    });
    this.svcs.editorSvc.applyMarkers(diagnostics);
  }

  async convertSpec(
    spec: string,
    version: ConvertVersion = this.getLastVersion() as ConvertVersion,
  ): Promise<string> {
    try {
      const converted = convert(spec, version);
      if (typeof converted === 'object') {
        return JSON.stringify(converted, undefined, 2);
      }
      return converted;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  getSpecs() {
    return specs;
  }

  getLastVersion(): SpecVersions {
    return Object.keys(specs).pop() as SpecVersions;
  }

  shouldInformAboutLatestVersion(
    version: string,
  ): boolean {
    const oneDay = 24 * 60 * 60 * 1000; /* ms */

    const nowDate = new Date();
    let dateOfLastQuestion = nowDate;
    const localStorageItem = sessionStorage.getItem('informed-about-latest');
    if (localStorageItem) {
      dateOfLastQuestion = new Date(localStorageItem);
    }

    const isOvertime =
      nowDate === dateOfLastQuestion ||
      nowDate.getTime() - dateOfLastQuestion.getTime() > oneDay;
    if (isOvertime && version !== this.getLastVersion()) {
      sessionStorage.setItem('informed-about-latest', nowDate.toString());
      return true;
    }

    return false;
  }

  getRangeForJsonPath(jsonPath: string | Array<string | number>) {
    try {
      const extras = this.getParsedExtras();
      if (extras) {
        jsonPath = Array.isArray(jsonPath) ? jsonPath : jsonPath.split('/').map(untilde);
        if (jsonPath[0] === '') jsonPath.shift();
        return extras.document.getRangeForJsonPath(jsonPath, true);
      }
    } catch (err: any) {
      return;
    }
  }

  filterDiagnostics(diagnostics: Diagnostic[] = state.parser.diagnostics.get()) {
    const governanceShowState = state.settings.governance.show.get();
    return diagnostics.filter(({ severity }) => {
      return (
        severity === DiagnosticSeverity.Error ||
        (severity === DiagnosticSeverity.Warning && governanceShowState.warnings) ||
        (severity === DiagnosticSeverity.Information && governanceShowState.informations) ||
        (severity === DiagnosticSeverity.Hint && governanceShowState.hints)
      );
    });
  }
}