import { Injectable, SingletonScope } from "@adi/core";
import { Uri } from 'monaco-editor/esm/vs/editor/editor.api';

import { FileSystemService } from './filesystem.service';

import { FileType } from './interfaces';

import type { FileStat } from './interfaces';
import type { BrowserFileSystemAPI } from './filesystem.service';

@Injectable({
  scope: SingletonScope,
})
export class BrowserFileSystemServive extends FileSystemService implements BrowserFileSystemAPI {
	private dirHandle!: FileSystemDirectoryHandle;

	private readonly directoriesHandles = new Map<string, FileSystemDirectoryHandle>();
	private readonly filesHandles = new Map<string, FileSystemFileHandle>();

  async openDirectory() {
    this.dirHandle = await window.showDirectoryPicker({
      mode: '',
    });
		this.refreshHandles();
  }

	async refreshHandles() {
		if (!this.dirHandle) {
			return;
		}

		this.directoriesHandles.clear();
		this.filesHandles.clear();
		await this.registerHandles(this.dirHandle, '', true);
	}

  async stat(uri: Uri | string): Promise<FileStat> {
		try {
			const handle = this.getHandle(uri);
      if (!handle) {
        throw new Error('No such file or directory, stat');
      }

			if (this.isFileSystemFileHandle(handle)) {
				const file = await handle.getFile();
				return {
					type: FileType.File,
					mtime: file.lastModified,
					ctime: 0,
					size: file.size
				};
			}

			return {
				type: FileType.Directory,
				mtime: 0,
				ctime: 0,
				size: 0
			};
		} catch (error) {
			throw error;
		}
  }

  async readDirectory(uri: Uri | string): Promise<Array<[string, FileType]>> {
		if (!this.dirHandle) {
			return [];
		}

		try {
			const handle = this.getDirectoryHandle(this.dirname(uri));
			if (!handle) {
				throw new Error('No such file or directory, readDirectory')
			}

			const result: Array<[string, FileType]> = [];
			for await (const [name, child] of handle) {
				if (this.isFileSystemFileHandle(child)) {
					if (this.isSupportedExtension(child.name)) {
						result.push([name, FileType.File]);
					}
					continue;
				}
        result.push([name, FileType.Directory]);
			}

			return result;
		} catch (error) {
			throw error;
		}
  }

  async createDirectory(uri: Uri | string): Promise<void> {
		if (!this.dirHandle) {
			return;
		}

		try {
      const parentDir = this.getDirectoryHandle(this.dirname(uri));
			if (!parentDir) {
				throw new Error('No such parent directory, createDirectory');
			}

			const dirHandle = await parentDir.getDirectoryHandle(this.basename(uri), { create: true });
			this.registerDirectoryHandle(dirHandle, uri);
		} catch (error) {
			throw error;
		}
  }

  async readFile(uri: Uri | string): Promise<Uint8Array> {
		if (!this.dirHandle) {
			return new Uint8Array();
		}

		try {
			const handle = this.getFileHandle(uri);
			if (!handle) {
        throw new Error('No such file or directory, readFile');
			}

			const file = await handle.getFile();
			return new Uint8Array(await file.arrayBuffer());
		} catch (error) {
			console.log(error);
			throw error;
		}
  }

  async writeFile(uri: Uri | string, content: Uint8Array, options: { create: boolean, overwrite: boolean } = { create: false, overwrite: false }): Promise<void> {
		if (!this.dirHandle) {
			return;
		}

		try {
			let handle = this.getFileHandle(uri);

			// Validate target unless { create: true, overwrite: true }
			if (!options.create || !options.overwrite) {
				if (handle) {
					if (!options.overwrite) {
						throw new Error('File already exists, writeFile');
					}
				} else {
					if (!options.create) {
            throw new Error('No such file, writeFile');
					}
				}
			}

			// Create target as needed
			if (!handle) {
				const parentDir = this.getDirectoryHandle(this.dirname(uri));
				if (!parentDir) {
					throw new Error('No such parent directory, writeFile');
				}

				handle = await parentDir.getFileHandle(this.basename(uri), { create: true });
				if (!handle) {
					throw new Error('Unable to create file, writeFile');
				}

        this.registerFileHandle(handle, uri);
			}

			// Write to target overwriting any existing contents
			const writable = await handle.createWritable();
			await writable.write(content);
			await writable.close();
		} catch (error) {
			throw error;
		}
  }

  async delete(uri: Uri | string, options: { recursive: boolean } = { recursive: true }): Promise<void> {
		if (!this.dirHandle) {
			return;
		}

		try {
      const parentDir = this.getDirectoryHandle(this.dirname(uri));
			if (!parentDir) {
				throw new Error('No such parent directory, delete');
			}

			await parentDir.removeEntry(this.basename(uri), options);
			await this.refreshHandles();
		} catch (error) {
			throw error;
		}
  }

  async rename(from: Uri | string, to: Uri | string, options: { overwrite: boolean } = { overwrite: true }): Promise<void> {
		if (!this.dirHandle) {
			return;
		}

		try {
			const fromUriString = this.toFileUriString(from);
			const toUriString = this.toFileUriString(to);

			const fromDirName = this.dirname(fromUriString);
			if (this.dirname(toUriString) !== fromDirName) {
				to = `${fromDirName}/${this.filename(to)}`;
			}

			if (fromUriString === this.toFileUriString(to)) {
				return; // no-op if the paths are the same
			}

			await this.tryRenameFile(from, to, options);
			await this.refreshHandles();
		} catch (e1) {
			try {
				await this.tryRenameDirectory(from, to, options);
				await this.refreshHandles();
			} catch(e2) {
				throw new Error("Cannot rename, rename");
			}
		}
  }

	private async tryRenameFile(from: Uri | string, to: Uri | string, options: { overwrite: boolean }): Promise<void> {
		try {
			const fileHandle = this.getFileHandle(from);
			if (!fileHandle) {
				throw new Error("Cannot find given file handle, tryRenameFile");
			}

			await this.moveFile(fileHandle, from, to, options);
		} catch (error) {
			throw error;
		}
	}

	private async tryRenameDirectory(from: Uri | string, to: Uri | string, options: { overwrite: boolean }): Promise<void> {
		try {
			// Implement directory rename by write + delete
			const directoryHandle = this.getDirectoryHandle(from);
			if (!directoryHandle) {
				throw new Error("Cannot find given directory handle, tryRenameDirectory");
			}

			await this.moveDirectory(directoryHandle, from, to, options);
		} catch (error) {
			// throw error;
		}
	}

	private async moveDirectory(directoryHandle: FileSystemDirectoryHandle, from: Uri | string, to: Uri | string, options: { overwrite: boolean } = { overwrite: true }) {
		await this.createDirectory(to);

		for await (const entry of directoryHandle.values()) {
			const fromPath = `${from}/${entry.name}`;
			const toPath = `${to}/${entry.name}`;
			if (this.isFileSystemDirectoryHandle(entry)) {
				await this.moveDirectory(entry, fromPath, toPath, options);
				continue;
			}
			await this.moveFile(entry, fromPath, toPath, options);
		}

		await this.delete(from, { recursive: true });
	}


	private async moveFile(fileHandle: FileSystemFileHandle, from: Uri | string, to: Uri | string, options: { overwrite: boolean } = { overwrite: true }) {
		const file = await fileHandle.getFile();
		const contents = new Uint8Array(await file.arrayBuffer());

		await this.writeFile(to, contents, { create: true, overwrite: options.overwrite });
		await this.delete(from, { recursive: false });
	}

  private getHandle(uri: Uri | string): FileSystemHandle | undefined {
    const uriString = this.toFileUriString(uri);
    return this.filesHandles.get(uriString) || this.directoriesHandles.get(uriString);
  }

  private getDirectoryHandle(uri: Uri | string): FileSystemDirectoryHandle | undefined {
    const uriString = this.toFileUriString(uri);
    return this.directoriesHandles.get(uriString);
  }

  private getFileHandle(uri: Uri | string): FileSystemFileHandle | undefined {
    const uriString = this.toFileUriString(uri);
    return this.filesHandles.get(uriString);
  }

  private async registerHandles(handle: FileSystemDirectoryHandle | FileSystemFileHandle, path: string, isRoot: boolean): Promise<void> {
    if (this.isFileSystemDirectoryHandle(handle)) {
      const dirPath = isRoot ? path : `${path}/${handle.name}`;
      this.registerDirectoryHandle(handle, dirPath);
      for await (const entry of handle.values()) {
        await this.registerHandles(entry, dirPath, false);
      }
      return;
    }

    if (this.isSupportedExtension(handle.name)) {
      this.registerFileHandle(handle, `${path}/${handle.name}`);
    }
	}

  private async registerDirectoryHandle(handle: FileSystemDirectoryHandle, pathOrUri: string | Uri): Promise<void> {
    pathOrUri = this.toFileUri(pathOrUri);
    this.directoriesHandles.set(pathOrUri.toString(), handle);
	}

  private async registerFileHandle(handle: FileSystemFileHandle, pathOrUri: string | Uri): Promise<void> {
    pathOrUri = this.toFileUri(pathOrUri);
    this.filesHandles.set(pathOrUri.toString(), handle);
	}

	private supportedExtensions = ['json', 'yaml', 'yml'];
	private isSupportedExtension(name: string) {
		const extension = this.extension(name);
		return this.supportedExtensions.includes(extension);
	}

  private toFileUri(pathOrUri: string | Uri): Uri {
    if (!Uri.isUri(pathOrUri)) {
      pathOrUri = Uri.file(pathOrUri.replace(/^file:\/\/\//, ''));
    }
    return pathOrUri;
  }

  private toFileUriString(pathOrUri: string | Uri): string {
    pathOrUri = this.toFileUri(pathOrUri);
    return pathOrUri.toString();
  }

  private isFileSystemDirectoryHandle(handle: FileSystemHandle): handle is FileSystemDirectoryHandle {
		return handle.kind === 'directory';
	}

  private isFileSystemFileHandle(handle: FileSystemHandle): handle is FileSystemFileHandle {
		return handle.kind === 'file';
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

  hasFileSystemAccess(): boolean | Promise<boolean> {
    return typeof window === 'object' && 'showOpenFilePicker' in window;
  }
}
