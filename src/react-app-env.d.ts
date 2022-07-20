/// <reference types="react-scripts" />
/// <reference types="wicg-file-system-access" />

import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';

declare global {
  interface Window {
    MonacoEnvironment: monacoAPI.Environment | undefined;
  }
}
