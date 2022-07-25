import { Inject, Injectable, SingletonScope } from "@adi/core";
import { setDiagnosticsOptions } from 'monaco-yaml';
import { Uri } from 'monaco-editor/esm/vs/editor/editor.api';

import type { OnInit } from "@adi/core";
import type { DiagnosticsOptions as YAMLDiagnosticsOptions } from 'monaco-yaml';
import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';

@Injectable({
  scope: SingletonScope,
})
export class MonacoService implements OnInit {
  private editors: Map<string, monacoAPI.editor.IStandaloneCodeEditor> = new Map();
  private themeName = 'asyncapi-theme';

  constructor(
    @Inject('studio:monaco') private readonly monaco: typeof monacoAPI,
  ) {}

  onInit(): void | Promise<void> {
    this.configureMonacoWorkers();
    this.defineTheme();
    this.monaco.editor.setTheme(this.themeName);
  }

  getOrCreateModel(value: string, language: string, uri: string | Uri) {
    return this.getModel(uri) || this.createModel(value, language, uri);
  }

  getModel(path: string | Uri) {
    return this.monaco
      .editor
      .getModel(this.parseModelUri(path));
  }

  createModel(value: string, language: string, uri?: string | Uri) {
    return this.monaco
      .editor
      .createModel(value, language, uri ? this.parseModelUri(uri) : undefined);
  }

  removeModel(uri: string | Uri) {
    const model = this.getModel(uri);
    model && model.dispose();
  }

  getEditor(uri: string | Uri) {
    uri = this.parseModelUri(uri).toString();
    return this.editors.get(uri);
  }

  createEditor(domElement: HTMLElement, options?: monacoAPI.editor.IStandaloneEditorConstructionOptions, override?: monacoAPI.editor.IEditorOverrideServices): monacoAPI.editor.IStandaloneCodeEditor {
    const editor = this.monaco.editor.create(domElement, options, override);
    const uri = editor.getModel()?.uri.toString();
    if (uri) {
      this.editors.set(uri, editor);
    }
    return editor;
  };

  removeEditor(editor?: monacoAPI.editor.IStandaloneCodeEditor | string | Uri): void {
    let uri: string | undefined;
    if (typeof editor === 'string' || editor instanceof Uri) {
      uri = this.parseModelUri(editor).toString();
      editor = this.editors.get(uri);
    }
    if (!editor) {
      return;
    }
    if (uri) {
      this.editors.delete(uri);
    }
    return editor?.dispose();
  }

  setJSONDiagnosticsOptions(options: monacoAPI.languages.json.DiagnosticsOptions) {
    this.monaco.languages.json.jsonDefaults.setDiagnosticsOptions(options);
  }

  setYAMLDiagnosticsOptions(options: YAMLDiagnosticsOptions) {
    setDiagnosticsOptions(options);
  }

  async scrollToEditorLine(uri: string | Uri, startLine: number, columnLine = 1) {
    try {
      const editor = this.getEditor(uri);
      if (editor) {
        editor.revealLineInCenter(startLine);
        editor.setPosition({ lineNumber: startLine, column: columnLine });
      }
    } catch (err) {
      console.error(err);
    }
  }

  private parseModelUri(uri: string | Uri) {
    return Uri.isUri(uri) ? uri : Uri.parse(uri);
  }

  private defineTheme() {
    this.monaco.editor.defineTheme(this.themeName, {
      base: 'vs-dark',
      inherit: true,
      colors: {
        'editor.background': '#252f3f',
        'editor.lineHighlightBackground': '#1f2a37',
      },
      rules: [{ token: '', background: '#252f3f' }],
    });
  }

  private configureMonacoWorkers() {
    window.MonacoEnvironment = window.MonacoEnvironment || {
      getWorkerUrl(_: string, label: string) {
        switch (label) {
          case 'editorWorkerService': return `${process.env.PUBLIC_URL}/js/monaco/editor.worker.bundle.js`;
          case 'json': return `${process.env.PUBLIC_URL}/js/monaco/json.worker.bundle.js`;
          case 'yaml':
          case 'yml': {
            return `${process.env.PUBLIC_URL}/js/monaco/yaml.worker.bundle.js`;
          }
          default: {
            throw new Error(`Unknown label ${label}`);
          }
        }
      },
    };

    // window.MonacoEnvironment = {
    //   getWorker(_, label) {
    //     console.log(label);
    //     switch (label) {
    //       case 'editorWorkerService':
    //         return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
    //       case 'json':
    //         return new Worker(
    //           new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url),
    //         );
    //       case 'yaml':
    //       case 'yml':
    //         return new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url));
    //       default:
    //         throw new Error(`Unknown label ${label}`);
    //     }
    //   },
    // };
  }
}
