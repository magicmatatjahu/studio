import { Inject, Injectable, SingletonScope } from "@adi/core";
import { VscTrash, VscEdit, VscFolder, VscFolderOpened, VscNewFile, VscNewFolder, VscJson, VscRefresh } from 'react-icons/vsc';

import { BrowserFileSystemServive } from "../../filesystem/services/browser-filesystem.service";
import { PanelsManager } from "../../core/services/panels-manager.service";
import { EventEmitterService } from "../../events/services/event-emitter.service";

import { Uri } from 'monaco-editor/esm/vs/editor/editor.api';

import { FileType } from "../../filesystem/services/interfaces";

import type { OnInit } from "@adi/core";
import type { TreeViewItem, TreeViewItemDetail } from '../../core/components/common/TreeView/interfaces';
import type { ExpandedPanelAction } from '../../core/components/common/ExpandedPanel/interfaces';
import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';

@Injectable({
  scope: SingletonScope,
})
export class BrowserFileSystemExplorer implements OnInit {
  // stringified file uri -> tab id
  private associatedTabs: Map<string, string> = new Map();

  constructor(
    private readonly browserFileSystemServive: BrowserFileSystemServive,
    private readonly panelsManager: PanelsManager,
    private readonly eventEmitter: EventEmitterService,
    @Inject('studio:monaco') private readonly monaco: typeof monacoAPI,
  ) {}

  onInit() {
    this.eventEmitter.subscribe('studio:panels:delete-tab', ({ tab }) => {
      this.associatedTabs.delete(tab.id);
    });
  }

  createPanelActions(): Array<ExpandedPanelAction> {
    return [
      {
        label: 'Create file',
        icon: VscNewFile,
        props: () => {
          return {
            onClick: async (e) => {
              e.stopPropagation();
              const fileName = prompt("File name");
              await this.browserFileSystemServive.createFile(fileName as string, new Uint8Array());
              this.eventEmitter.emit('studio:bfs:create-file', { payload: { fileName } });
            }
          }
        }
      },
      {
        label: 'Create directory',
        icon: VscNewFolder,
        props: () => {
          return {
            onClick: async (e) => {
              e.stopPropagation();
              const directoryName = prompt("Directory name");
              await this.browserFileSystemServive.createDirectory(directoryName as string);
              this.eventEmitter.emit('studio:bfs:create-directory', { payload: { directoryName } });
            }
          }
        }
      },
      {
        label: 'Refresh explorer',
        icon: VscRefresh,
        props: () => {
          return {
            onClick: async (e) => {
              e.stopPropagation();
              await this.browserFileSystemServive.refreshHandles();
            }
          }
        }
      },
    ];
  }

  async createTree(): Promise<Array<TreeViewItem>> {
    return this.createTreeElements('');
  }

  createTreeDetails(): Array<TreeViewItemDetail> {
    return [
      {
        kind: 'directory',
        defaultIcon: VscFolder,
        expandedIcon: VscFolderOpened,
        collapsedIcon: VscFolder,
        label: 'Directory',
        actions: [
          {
            label: 'Create file',
            icon: VscNewFile,
            props: (item) => {
              return {
                onClick: async (e) => {
                  e.stopPropagation();
                  const fileName = prompt("File name");
                  await this.browserFileSystemServive.createFile(`${item.label}/${fileName}`, new Uint8Array());
                  this.eventEmitter.emit('studio:bfs:create-file', { payload: { fileName: `${item.label}/${fileName}` } });
                }
              }
            }
          },
          {
            label: 'Create directory',
            icon: VscNewFolder,
            props: (item) => {
              return {
                onClick: async (e) => {
                  e.stopPropagation();
                  const directoryName = prompt("Directory name");
                  await this.browserFileSystemServive.createDirectory(`${item.label}/${directoryName}`);
                  this.eventEmitter.emit('studio:bfs:create-directory', { payload: { directoryName: `${item.label}/${directoryName}` } });
                }
              }
            }
          },
          {
            label: 'Rename directory',
            icon: VscEdit,
            props: (item) => {
              return {
                onClick: async (e) => {
                  e.stopPropagation();
                  const directoryName = prompt("New directory name");
                  await this.browserFileSystemServive.rename(item.label, directoryName as string);
                  this.eventEmitter.emit('studio:bfs:rename-file', { payload: { directoryName } });
                }
              }
            }
          },
          {
            label: 'Remove directory',
            icon: VscTrash,
            props: (item) => {
              return {
                onClick: async (e) => {
                  e.stopPropagation();
                  await this.browserFileSystemServive.delete(item.label);
                  this.eventEmitter.emit('studio:bfs:delete-directory', { payload: { fileName: item.label } });
                }
              }
            }
          },
        ]
      },
      {
        kind: 'file',
        defaultIcon: VscJson,
        label: 'File',
        props: (item) => {
          return {
            onDoubleClick: () => {
              const fileUriString = Uri.file(item.label).toString();
              const possibleTab = this.associatedTabs.get(fileUriString);
              if (possibleTab) {
                const tab = this.panelsManager.getTab(possibleTab);
                if (tab) {
                  this.panelsManager.setActiveTab(tab.id);
                  this.panelsManager.setActivePanel(tab.panelId);
                }
              } else {
                const tab = this.panelsManager.createTab(undefined, 'studio:view:monaco-editor', { item });
                this.associatedTabs.set(fileUriString, tab.id);
              }
            }
          }
        },
        actions: [
          {
            label: 'Rename file',
            icon: VscEdit,
            props: (item) => {
              return {
                onClick: async (e) => {
                  e.stopPropagation();
                  const fileName = prompt("New file name");
                  await this.browserFileSystemServive.rename(item.label, fileName as string);
                  this.eventEmitter.emit('studio:bfs:rename-file', { payload: { fileName } });
                }
              }
            }
          },
          {
            label: 'Remove file',
            icon: VscTrash,
            props: (item) => {
              return {
                onClick: async (e) => {
                  e.stopPropagation();
                  await this.browserFileSystemServive.delete(item.label);
                  this.eventEmitter.emit('studio:bfs:delete-file', { payload: { fileName: item.label } });
                }
              }
            }
          },
        ]
      }
    ];
  }

  private async createTreeElements(path: string): Promise<Array<TreeViewItem>> {
    const tree: Array<TreeViewItem> = [];
    const files = await this.browserFileSystemServive.readDirectory(path);
    for (const file of files) {
      const fileName = file[0];
      const itemPath = `${path}${fileName}`;

      if (file[1] === FileType.Directory) {
        tree.push({
          id: itemPath,
          kind: 'directory',
          label: itemPath,
          content: fileName,
          items: await this.createTreeElements(`${itemPath}/`),
        });
        continue;
      }

      tree.push({
        id: itemPath,
        kind: 'file',
        label: itemPath,
        content: fileName,
      });
    }
    return tree;
  }
}