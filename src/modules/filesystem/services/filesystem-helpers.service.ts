import { Injectable, SingletonScope } from "@adi/core";
import { Uri } from 'monaco-editor/esm/vs/editor/editor.api';

@Injectable({
  scope: SingletonScope,
})
export class FileSystemHelpersServive {
  uint8ArrayToString(unit8Array: Uint8Array) {
    return Buffer.from(unit8Array.buffer).toString();
  }

  stringToUint8Array(str: string): Uint8Array {
    return new Uint8Array(str.split('').map(l => l.charCodeAt(0)));
  }

  toFileUri(pathOrUri: string | Uri): Uri {
    if (!Uri.isUri(pathOrUri)) {
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