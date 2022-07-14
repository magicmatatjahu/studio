/// <reference types="react-scripts" />

import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';

declare global {
  interface Window {
    MonacoEnvironment: monacoAPI.Environment | undefined;
  }
}
