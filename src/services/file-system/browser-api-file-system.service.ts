import { AbstractFileSystem } from './abstract-file-system.service';

import type { File } from './abstract-file-system.service';
import type { Uri } from './abstract-file-system.service';

export class BrowserFileSystemServive extends AbstractFileSystem {
	private rootHandle: FileSystemDirectoryHandle | undefined;
	private readonly files = new Map<string, File>();

  async openDirectory() {
    this.rootHandle = await window.showDirectoryPicker({
      mode: '',
    });
  }

  async createDirectory(uri: Uri | string): Promise<void> {
		try {
      const parentDir = this.getFile(this.dirname(uri));
			if (!parentDir || parentDir.type !== 'directory') {
				return;
			}

			const dirHandle = await parentDir.handle.getDirectoryHandle(this.basename(uri), { create: true });
			this.registerDirectory(uri, dirHandle, parentDir);
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

  async writeFile(uri: Uri | string, content: string, options: { create: boolean, overwrite: boolean } = { create: false, overwrite: false }): Promise<void> {
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

        this.registerFile(uri, handle, parentDir);
			} else if (this.isDirectoryHandle(handle)) {
        return;
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
		try {
      const file = this.getFile(uri);
			if (!file) {
				return;
			}

      const { parent, uriString } = file;
      if (parent) {
        await parent.handle.removeEntry(this.basename(uri), options);
        parent.children = (parent.children || []).filter(f => f.uriString !== uriString);
      }
      this.files.delete(uriString);
		} catch (error) {
			throw error;
		}
  }

  async rename(from: Uri | string, to: Uri | string, options: { overwrite: boolean } = { overwrite: true }): Promise<void> {
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
      const dirPath = `${path}/${handle.name}`;
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
      type: 'file',
      parent,
      children: [],
      handle,
    }
    this.files.set(file.uriString, file);
    parent?.children?.push(file);
    return file;
	}

  private async registerFile(pathOrUri: string | Uri, handle: FileSystemFileHandle, parent: File): Promise<File> {
    const uri = this.toFileUri(pathOrUri);
    const fileHandle = await handle.getFile();
    const file: File = {
      uri,
      uriString: uri.toString(),
      name: handle.name,
      type: 'directory',
      stat: {
        mtime: fileHandle.lastModified,
        size: fileHandle.size,
      },
      parent,
      handle,
    }
    this.files.set(file.uriString, file);
    parent?.children?.push(file);
    return file;
	}

  private isDirectoryHandle(handle: FileSystemHandle): handle is FileSystemDirectoryHandle {
		return handle.kind === 'directory';
	}

  private isFileHandle(handle: FileSystemHandle): handle is FileSystemFileHandle {
		return handle.kind === 'file';
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
