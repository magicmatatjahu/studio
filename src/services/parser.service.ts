import { Parser, convertToOldAPI, DiagnosticSeverity } from '@asyncapi/parser/cjs';
import { OpenAPISchemaParser } from '@asyncapi/parser/cjs/schema-parser/openapi-schema-parser';
import { AvroSchemaParser } from '@asyncapi/parser/cjs/schema-parser/avro-schema-parser';

import { AbstractService } from './abstract.service';
import { documentsState, settingsState } from '../state/new';

import type { OldAsyncAPIDocument as AsyncAPIDocument, Diagnostic, ParseOptions } from '@asyncapi/parser/cjs';

export class ParserService extends AbstractService {
  private parser!: Parser;

  public override onInit() {
    const parser = this.parser = new Parser({
      schemaParsers: [
        OpenAPISchemaParser(),
        AvroSchemaParser(),
      ],
      __unstable: {
        resolver: {
          cache: false,
        }
      }
    });
  }

  async parse(content: string, options?: ParseOptions): Promise<AsyncAPIDocument | void> {
    const { updateDocument } = documentsState.getState();

    let diagnostics: Diagnostic[] = [];
    try {
      const { document, diagnostics: originalDiagnostics, extras } = await this.parser.parse(content, options);
      diagnostics = originalDiagnostics;
  
      if (document) {
        const oldDocument = convertToOldAPI(document);

        updateDocument('asyncapi', { 
          document: oldDocument,
          diagnostics,
          extras,
          valid: true,
        });
  
        const version = oldDocument.version() as SpecVersions;
        MonacoService.updateLanguageConfig(version);
        if (this.shouldInformAboutLatestVersion(version)) {
          state.spec.set({
            shouldOpenConvertModal: true,
            convertOnlyToLatest: false,
            forceConvert: false,
          });
        }
  
        EditorService.applyMarkers(diagnostics);
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
      MonacoService.updateLanguageConfig(version);
    } catch (e: any) {
      // intentional
    }

    state.parser.set({
      parsedSpec: null,
      valid: false,
      diagnostics,
      hasErrorDiagnostics: true,
    });
    EditorService.applyMarkers(diagnostics);
  }

  private filterDiagnostics(diagnostics: Diagnostic[]) {
    const { governance: { show } } = settingsState.getState();
    return diagnostics.filter(({ severity }) => {
      return (
        severity === DiagnosticSeverity.Error ||
        (severity === DiagnosticSeverity.Warning && show.warnings) ||
        (severity === DiagnosticSeverity.Information && show.informations) ||
        (severity === DiagnosticSeverity.Hint && show.hints)
      );
    });
  }
}
