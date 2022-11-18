import { createState, useState } from '@hookstate/core';

import type { File } from '../services/file-system/abstract-file-system.service'

export interface FileSystemState {
  browserAPIFiles: Array<File>;
  memoryFiles: Array<File>;
}

export const fileSystemState = createState<FileSystemState>({
  browserAPIFiles: [],
  memoryFiles: [],
});

export function useFileSystemState() {
  return useState(fileSystemState);
}
