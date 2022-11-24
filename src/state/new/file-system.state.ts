import create from 'zustand';
import { persist } from 'zustand/middleware';
import { Uri } from 'monaco-editor/esm/vs/editor/editor.api';

export interface FileStat {
  mtime: number;
  size: number;
}

export type File = {
  uri: Uri;
  uriString: string;
  name: string;
  content: string;
  language: 'json' | 'yaml';
  modified: boolean;
  stat?: FileStat;
}

export type FileSystemState = {
  files: Record<string, File>;
}

export type FileSystemActions = {
  updateFile: (uri: string, file: Partial<File>) => void;
}

export const fileSystemState = create(
  persist<FileSystemState & FileSystemActions>((set) => 
    ({
      files: {},
      updateFile(uri: string, file: Partial<File>) {
        set(state => ({ files: { ...state.files, [uri]: { ...state.files[uri], ...file } } }));
      },
    }), 
    {
      name: 'studio-files',
      getStorage: () => localStorage,
      deserialize: (strState) => {
        const state = JSON.parse(strState);
        Object.keys((state as FileSystemState).files).forEach(key => {
          const file = (state as FileSystemState).files[key];
          file.uri = Uri.parse(file.uriString);
        });
        return state;
      },
      partialize: (state) => {
        const newFiles = Object.fromEntries(
          Object.entries(state.files).map(([key, file]) => [key, { ...file, uri: undefined }])
        ) as unknown as Record<string, File>;

        return {
          ...state,
          files: newFiles,
        }
      },
    }
  ),
);

export const useFileSystemState = fileSystemState;
