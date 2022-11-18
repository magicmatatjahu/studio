import { AbstractFileSystem } from './abstract-file-system.service';

import state from '../../state';

import type { File, Uri } from './abstract-file-system.service';

export class BrowserAPIFileSystemServive extends AbstractFileSystem {
	private rootHandle: FileSystemDirectoryHandle | undefined;
	private readonly files = new Map<string, File>();

  async openDirectory() {
		if (this.rootHandle) {
			return;
		}

    const handle = this.rootHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
    });
		await this.registerFiles('', handle);
		this.updateState();

		setInterval(() => {
			this.refresh();
		}, 2000);
  }

	async refresh() {
		if (this.rootHandle) {
			this.files.clear();
			await this.registerFiles('', this.rootHandle);
			this.updateState();
		}
	}

  override async createDirectory(uri: Uri | string): Promise<void> {
		try {
			if (this.getFile(uri)) {
				return;
			}

      const parentDir = this.getFile(this.dirname(uri));
			if (!parentDir || parentDir.type !== 'directory') {
				return;
			}

			const dirHandle = await parentDir.handle.getDirectoryHandle(this.basename(uri), { create: true });
			this.registerDirectory(uri, dirHandle, parentDir);
			this.updateState();
		} catch (_) {
			return;
		}
  }

  override getFile(uri: Uri | string): File | undefined {
    const uriString = this.toFileUriString(uri);
    return this.files.get(uriString);
  }

  override async readFile(uri: Uri | string): Promise<string> {
		try {
			const file = this.getFile(uri);
			if (!file || file.type !== 'file') {
        return '';
			}

      const handle: FileSystemFileHandle = file.handle;
			return (await handle.getFile()).text();
		} catch (_) {
			return '';
		}
  }

  override async writeFile(uri: Uri | string, content: string, options: { create: boolean, overwrite: boolean } = { create: false, overwrite: false }): Promise<void> {
		try {
      let handle: FileSystemFileHandle = this.getFile(uri)?.handle;

			// Validate target unless { create: true, overwrite: true }
			if (!options.create || !options.overwrite) {
				if (handle) {
					if (!options.overwrite) {
						return;
					}
				} else {
					if (!options.create) {
            return;
					}
				}
			}

			// Create target as needed
			if (!handle) {
				const parentDir = this.getFile(this.dirname(uri));
				if (!parentDir || parentDir.type !== 'directory') {
					return;
				}

        const parentDirHandle: FileSystemDirectoryHandle = parentDir.handle;
				handle = await parentDirHandle.getFileHandle(this.basename(uri), { create: true });
				if (!handle) {
					return;
				}

        await this.registerFile(uri, handle, parentDir);
				this.updateState();
			} else if (this.isDirectoryHandle(handle)) {
        return;
      }

			// Write to target overwriting any existing contents
			const writable = await handle.createWritable();
			await writable.write(content);
			await writable.close();
		} catch (_) {
			return;
		}
  }

  override async delete(uri: Uri | string, options: { recursive: boolean } = { recursive: true }): Promise<void> {
		try {
			const file = this.getFile(uri);
			if (!file) {
				return;
			}


      const { parent, uriString } = file;
      if (parent && parent.type === 'directory') {
        await parent.handle.removeEntry(this.basename(uri), options);
        parent.children = (parent.children || []).filter(f => f.uriString !== uriString);
      }
      this.files.delete(uriString);
			this.updateState();
		} catch (_) {
			console.log(_)
			return;
		}
  }

  override async rename(from: Uri | string, to: Uri | string, options: { overwrite: boolean } = { overwrite: true }): Promise<void> {
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

      // TODO: Implement this
			// await this.tryRenameFile(from, to, options);
			// await this.refreshHandles();
		} catch (_) {
			try {
				// await this.tryRenameDirectory(from, to, options);
				// await this.refreshHandles();
			} catch(_) {
				return;
			}
		}
  }

  private async registerFiles(path: string, handle: FileSystemDirectoryHandle | FileSystemFileHandle, dirFile?: File): Promise<void> {
    if (this.isDirectoryHandle(handle)) {
      const dirPath = path ? `${path}/${handle.name}` : handle.name;
      const parentDir = this.registerDirectory(dirPath, handle, dirFile);
      for await (const fileHandle of handle.values()) {
        await this.registerFiles(dirPath, fileHandle, parentDir);
      }
      return;
    }

    if (this.isSupportedExtension(handle.name)) {
      await this.registerFile(`${path}/${handle.name}`, handle, dirFile as File);
    }
	}

  private registerDirectory(pathOrUri: string | Uri, handle: FileSystemDirectoryHandle, parent?: File): File {
    const uri = this.toFileUri(pathOrUri);
    const file: File = {
      uri,
      uriString: uri.toString(),
      name: handle.name,
      type: 'directory',
      parent,
      children: [],
      handle,
    }
    this.files.set(file.uriString, file);
    this.pushFile(file, parent);
    return file;
	}

  private async registerFile(pathOrUri: string | Uri, handle: FileSystemFileHandle, parent: File): Promise<File> {
    const uri = this.toFileUri(pathOrUri);
    const fileHandle = await handle.getFile();
    const file: File = {
      uri,
      uriString: uri.toString(),
      name: handle.name,
      type: 'file',
      stat: {
        mtime: fileHandle.lastModified,
        size: fileHandle.size,
      },
      parent,
      handle,
    }
    this.files.set(file.uriString, file);
    this.pushFile(file, parent);
    return file;
	}

  private isDirectoryHandle(handle: FileSystemHandle): handle is FileSystemDirectoryHandle {
		return handle.kind === 'directory';
	}

	private updateState(): void {
		const rootFiles: Array<File> = [];
		for (const file of this.files.values()) {
			if (file.parent?.handle === this.rootHandle) {
				rootFiles.push(file);
			}
		}
		state.fileSystem.browserAPIFiles.set(this.sortFiles(rootFiles));
	}

	private pushFile(file: File, parent?: File) {
		if (parent && parent.children) {
			parent.children.push(file);
			parent.children = this.sortFiles(parent.children);
		}
	}

	private sortFiles(files: Array<File>): Array<File> {
		return [...files].sort((a, b) => {
			const isADirectory = a.type === 'directory';
			const isBDirectory = b.type === 'directory';
			// directories
			if (isADirectory || isBDirectory) {
				if (isADirectory && isBDirectory) {
					if (a.name > b.name) return 1;
					if (a.name < b.name) return -1;
					return 0;
				}
				return isADirectory ? -1 : 1;
			}
			// files
			if (a.name > b.name) return 1;
			if (a.name < b.name) return -1;
			return 0;
		});
	}

  private supportedExtensions = ['json', 'yaml', 'yml'];
	private isSupportedExtension(name: string) {
		const extension = this.extension(name);
		return this.supportedExtensions.includes(extension);
	}

  override isSupported(): boolean | Promise<boolean> {
    return typeof window === 'object' && 'showOpenFilePicker' in window;
  }
}
