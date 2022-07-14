import * as monaco from 'monaco-editor';
import * as monacoYAML from 'monaco-yaml';
import { Uri } from 'monaco-editor/esm/vs/editor/editor.api';

import { Injectable, injectableMixin, SingletonScope } from "@adi/core";

import type { OnInit } from "@adi/core";
import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';

const THEME_NAME = 'asyncapi-theme';

@Injectable({
  scope: SingletonScope,
})
export class MonacoService implements OnInit {
  private viewStates = new Map<Uri, string>();

  onInit(): void | Promise<void> {
    this.configureMonacoWorkers();
    this.loadLanguagesConfig();
    this.defineTheme();
    this.monaco.editor.setTheme(THEME_NAME);
  }

  get monaco(): typeof monaco {
    return monaco;
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

  deleteModel(uri: string | Uri) {
    const model = this.getModel(uri);
    model && model.dispose();
  }

  private parseModelUri(uri: string | Uri) {
    return uri instanceof Uri ? uri : Uri.parse(uri);
  }

  private defineTheme() {
    this.monaco.editor.defineTheme(THEME_NAME, {
      base: 'vs-dark',
      inherit: true,
      colors: {
        'editor.background': '#252f3f',
        'editor.lineHighlightBackground': '#1f2a37',
      },
      rules: [{ token: '', background: '#252f3f' }],
    });
  }

  private loadLanguagesConfig() {
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
