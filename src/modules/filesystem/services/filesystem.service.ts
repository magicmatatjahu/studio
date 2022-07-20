import type { FileStat, FileType, Uri } from './interfaces';

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

  abstract stat(uri: Uri | string): FileStat | Promise<FileStat>;
  abstract readDirectory(uri: Uri | string): Array<[string, FileType]> | Promise<Array<[string, FileType]>>; 
  abstract createDirectory(uri: Uri | string): void | Promise<void>;
  abstract readFile(uri: Uri | string): Uint8Array | Promise<Uint8Array>;
  abstract writeFile(uri: Uri | string, content: Uint8Array, options: { create: boolean, overwrite: boolean }): void | Promise<void>;
  abstract delete(uri: Uri | string, options: { recursive: boolean }): void | Promise<void>;
  abstract rename(oldUri: Uri | string, newUri: Uri | string, options: { overwrite: boolean }): void | Promise<void>;

  createFile(uri: Uri | string, content: Uint8Array, options: { overwrite: boolean } = { overwrite: false }): void | Promise<void> {
    return this.writeFile(uri, content, { create: true, overwrite: options?.overwrite || false });
  }
  overwriteFile(uri: Uri | string, content: Uint8Array, options: { create: boolean } = { create: false }): void | Promise<void> {
    return this.writeFile(uri, content, { overwrite: true, create: options?.create || false });
  }
}

export interface BrowserFileSystemAPI {
  hasFileSystemAccess(): Promise<boolean> | boolean;
}
