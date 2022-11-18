import { Uri } from 'monaco-editor/esm/vs/editor/editor.api';

export { Uri };

export interface FileStat {
  mtime: number;
  size: number;
}

export interface File {
  uri: Uri;
  uriString: string;
  name: string;
  type: 'file' | 'directory';
  stat?: FileStat;
  parent?: File;
  children?: Array<File>;
  [key: string]: any;
}

export abstract class AbstractFileSystem {
  abstract createDirectory(uri: Uri | string): void | Promise<void>;
  abstract getFile(uri: Uri | string): File | undefined | Promise<File | undefined>;
  abstract readFile(uri: Uri | string): File | Promise<string>;
  abstract writeFile(uri: Uri | string, content: string, options: { create: boolean, overwrite: boolean }): void | Promise<void>;
  abstract delete(uri: Uri | string, options: { recursive: boolean }): void | Promise<void>;
  abstract rename(oldUri: Uri | string, newUri: Uri | string, options: { overwrite: boolean }): void | Promise<void>;

  createFile(uri: Uri | string, content: string, options: { overwrite: boolean } = { overwrite: false }): void | Promise<void> {
    return this.writeFile(uri, content, { create: true, overwrite: options?.overwrite || false });
  }

  overwriteFile(uri: Uri | string, content: string, options: { create: boolean } = { create: false }): void | Promise<void> {
    return this.writeFile(uri, content, { overwrite: true, create: options?.create || false });
  }

  isSupported(): boolean | Promise<boolean> {
    return true;
  }

  toFileUri(pathOrUri: string | Uri): Uri {
    if (typeof pathOrUri === 'string') {
      pathOrUri = Uri.file(pathOrUri.replace(/^file:\/\/\//, ''));
    }
    return pathOrUri;
  }

  toFileUriString(pathOrUri: string | Uri): string {
    pathOrUri = this.toFileUri(pathOrUri);
    return pathOrUri.toString();
  }

  // https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/12900504#12900504	
	extension(fname: string | Uri): string {
    fname = this.toFileUri(fname);
    return fname.path.slice((fname.path.lastIndexOf(".") - 1 >>> 0) + 2);
  }

	filename(path: string | Uri): string {
		path = this.toFileUri(path);
		return path.path.split('/').pop() || '';
	}

  dirname(path: string | Uri): string {
		path = this.toFileUri(path);
    return path.path.substring(0, path.path.lastIndexOf("/"));
  }

  basename(path: string | Uri): string {
    path = this.toFileUri(path);
    return path.path.substring(path.path.lastIndexOf('/') + 1);
	}
}