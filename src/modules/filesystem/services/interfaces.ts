import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';

export enum FileType {
  Unknown = 0,
  File = 1,
  Directory = 2,
  SymbolicLink = 64
}

export interface FileStat {
  type: FileType;
  ctime: number;
  mtime: number;
  size: number;
}

export enum FileChangeType {
  Changed = 1,
  Created = 2,
  Deleted = 3,
}

export interface FileChangeEvent {
  type: FileChangeType;
  uri: monacoAPI.Uri;
}

export type Uri = monacoAPI.Uri;