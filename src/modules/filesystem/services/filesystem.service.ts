import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';
import type { FileStat, FileType } from './interfaces';

export abstract class FileSystemService {
  // readonly onDidChangeFile: Event<FileChangeEvent[]>;

  // /**
  //  * Subscribe to events in the file or folder denoted by `uri`.
  //  *
  //  * The editor will call this function for files and folders. In the latter case, the
  //  * options differ from defaults, e.g. what files/folders to exclude from watching
  //  * and if subfolders, sub-subfolder, etc. should be watched (`recursive`).
  //  *
  //  * @param uri The uri of the file to be watched.
  //  * @param options Configures the watch.
  //  * @returns A disposable that tells the provider to stop watching the `uri`.
  //  */
  // watch(uri: Uri, options: { recursive: boolean; excludes: string[] }): Disposable;

  abstract stat(uri: monacoAPI.Uri): FileStat | Promise<FileStat>;
  abstract readDirectory(uri: monacoAPI.Uri): { [uri: string]: FileType } | Promise<{ [uri: string]: FileType }>; 
  abstract createDirectory(uri: monacoAPI.Uri): void | Promise<void>;
  abstract readFile(uri: monacoAPI.Uri): Uint8Array | Promise<Uint8Array>;
  abstract writeFile(uri: monacoAPI.Uri, content: Uint8Array, options: { create: boolean, overwrite: boolean }): void | Promise<void>;
  abstract delete(uri: monacoAPI.Uri, options: { recursive: boolean }): void | Promise<void>;
  abstract rename(oldUri: monacoAPI.Uri, newUri: monacoAPI.Uri, options: { overwrite: boolean }): void | Promise<void>;

  createFile(uri: monacoAPI.Uri, content: Uint8Array, options: { overwrite: boolean }): void | Promise<void> {
    return this.writeFile(uri, content, { create: true, overwrite: options?.overwrite || false });
  }
  overwriteFile(uri: monacoAPI.Uri, content: Uint8Array, options: { create: boolean }): void | Promise<void> {
    return this.writeFile(uri, content, { overwrite: true, create: options?.create || false });
  }
}
