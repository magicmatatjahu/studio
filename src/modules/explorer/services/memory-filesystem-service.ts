import { Injectable, SingletonScope } from "@adi/core";
import { FileSystemService } from "../../filesystem/services/filesystem.service";

import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';
import type { FileStat, FileType } from '../../filesystem/services/interfaces';

@Injectable({
  scope: SingletonScope,
})
export class MemoryFileSystemServive extends FileSystemService {
  stat(uri: monacoAPI.Uri): FileStat | Promise<FileStat> {
    return null as any;
  }

  readDirectory(uri: monacoAPI.Uri): Array<[string, FileType]> | Promise<Array<[string, FileType]>> {
    return null as any;
  }

  createDirectory(uri: monacoAPI.Uri): void | Promise<void> {

  }

  readFile(uri: monacoAPI.Uri): Uint8Array | Promise<Uint8Array> {
    return null as any;
  }

  writeFile(uri: monacoAPI.Uri, content: Uint8Array, options: { create: boolean, overwrite: boolean }): void | Promise<void> {

  }

  delete(uri: monacoAPI.Uri, options: { recursive: boolean }): void | Promise<void> {

  }

  rename(oldUri: monacoAPI.Uri, newUri: monacoAPI.Uri, options: { overwrite: boolean }): void | Promise<void> {

  }

  private lookup(uri: monacoAPI.Uri, silent: boolean) {
    const parts = uri.path.split('/');
    
  }
}