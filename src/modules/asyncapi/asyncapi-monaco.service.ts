import { Inject, Injectable, SingletonScope } from "@adi/core";

import { AsyncAPIService } from "./asyncapi.service";
import { MonacoService } from "../monaco/services/monaco.service";

import { debounce } from '../../helpers';

import type { OnInit } from '@adi/core';
import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';
import type { DiagnosticsOptions as YAMLDiagnosticsOptions } from 'monaco-yaml';

interface DiagnosticSchema {
  /**
   * The URI of the schema, which is also the identifier of the schema.
   */
  readonly uri: string;
  /**
   * A list of glob patterns that describe for which file URIs the JSON schema will be used.
   * '*' and '**' wildcards are supported. Exclusion patterns start with '!'.
   * For example '*.schema.json', 'package.json', '!foo*.schema.json', 'foo/**\/BADRESP.json'.
   * A match succeeds when there is at least one pattern matching and last matching pattern does not start with '!'.
   */
  readonly fileMatch?: string[];
  /**
   * The schema for the given URI.
   */
  readonly schema?: any;
};

@Injectable({
  scope: SingletonScope,
})
export class AsyncAPIMonacoService implements OnInit {
  private modelVersions: Map<monacoAPI.editor.ITextModel, string> = new Map();
  private specSchemas: Map<string, any> = new Map();
  private definitionsSchemas: Array<DiagnosticSchema> = [];

  constructor(
    private readonly asyncAPIService: AsyncAPIService,
    private readonly monacoService: MonacoService,
    @Inject('studio:monaco') private readonly monaco: typeof monacoAPI,
  ) {}

  onInit() {
    this.monaco.editor.onDidCreateModel(this.onDidCreateModel.bind(this));
  }

  private onDidCreateModel(model: monacoAPI.editor.ITextModel) {
    this.tryUpdateLanguageConfig(model);
    model.onDidChangeContent(debounce(() => this.tryUpdateLanguageConfig(model), 1000));
  }

  private tryUpdateLanguageConfig(model: monacoAPI.editor.ITextModel) {
    const asyncAPIVersion = this.asyncAPIService.tryRetrieveAsyncAPIVersion(model.getValue());
    if (asyncAPIVersion && this.asyncAPIService.isSupportedAsyncAPI(asyncAPIVersion)) {
      if (this.modelVersions.get(model) !== asyncAPIVersion) {
        this.modelVersions.set(model, asyncAPIVersion);
        return this.applyLanguageConfig();
      }
    }
  }

  private applyLanguageConfig() {
    const schemas: Array<DiagnosticSchema> = [];

    const specs = new Map<string, DiagnosticSchema>();
    this.modelVersions.forEach((version, model) => {
      if (!specs.has(version)) {
        const spec = this.getSpecSchema(version);
        const diagnosticSchema: DiagnosticSchema = {
          uri: spec.$id,
          fileMatch: [],
          schema: spec,
        } 
        specs.set(version, diagnosticSchema);
        schemas.push(diagnosticSchema);
      }
      specs.get(version)!.fileMatch!.push(model.uri.toString())
    });
    schemas.push(...this.getDefinitionsDiagnosticSchemas());

    this.monacoService.setJSONDiagnosticsOptions(this.createJSONLanguageConfig(schemas));
    this.monacoService.setYAMLDiagnosticsOptions(this.createYAMLLanguageConfig(schemas));
  }

  private createJSONLanguageConfig(schemas: Array<DiagnosticSchema>): monacoAPI.languages.json.DiagnosticsOptions {
    return {
      validate: true,
      schemas,
    };
  }

  private createYAMLLanguageConfig(schemas: Array<DiagnosticSchema>): YAMLDiagnosticsOptions {
    return {
      validate: true,
      completion: true,
      hover: true,
      schemas: schemas as any,
    };
  }

  private getSpecSchema(version: string) {
    const schema = this.specSchemas.get(version);
    if (schema) {
      return schema;
    }

    const spec = { ...this.asyncAPIService.getSpecificationJSONSchema(version) };
    delete spec.definitions;
    this.specSchemas.set(version, spec);
    return spec;
  }

  private getDefinitionsDiagnosticSchemas(): Array<DiagnosticSchema> {
    if (this.definitionsSchemas.length) {
      return this.definitionsSchemas;
    }

    const specs = this.asyncAPIService.getSpecificationJSONSchemas();
    for (const spec of Object.values(specs)) {
      const definitions = Object.entries(spec.definitions).map(([uri, schema]) => ({
        uri,
        schema,
      }));
      this.definitionsSchemas.push(...definitions);
    }

    return this.definitionsSchemas;
  }
}
