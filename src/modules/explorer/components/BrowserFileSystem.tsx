import { VscTrash, VscEdit, VscFolder, VscFolderOpened, VscFile, VscNewFile, VscNewFolder, VscJson } from 'react-icons/vsc';

import { TreeView } from '../../core/components/common/TreeView/TreeView';

import type React from 'react';
import type { TreeViewItem, TreeViewItemDetail } from '../../core/components/common/TreeView/interfaces';

interface BrowserFileSystemProps {}

export const BrowserFileSystem: React.FunctionComponent<BrowserFileSystemProps> = () => {
  const items: Array<TreeViewItem> = [
    {
      id: '1',
      kind: 'file',
      label: 'first dir',
      content: "first dir"
    },
    {
      id: '2',
      kind: 'file',
      label: 'second dir',
      content: "second dir"
    },
    {
      id: '3',
      kind: 'directory',
      label: 'first firectory',
      content: "first firectory",
      items: [
        {
          id: '4',
          kind: 'file',
          label: 'first dir',
          content: "first dir"
        },
        {
          id: '5',
          kind: 'directory',
          label: 'second directory',
          content: "second directory",
          items: [
            {
              id: '6',
              kind: 'file',
              label: 'first dir',
              content: "first dir"
            },
            {
              id: '7',
              kind: 'file',
              label: 'second dir',
              content: "second dir"
            },
          ]
        },
      ],
    }
  ];
  const details: Array<TreeViewItemDetail> = [
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
          action: 'studio:explorer:create-file',
        },
        {
          label: 'Create directory',
          icon: VscNewFolder,
          action: 'studio:explorer:create-directory',
        },
        {
          label: 'Edit directory',
          icon: VscEdit,
          action: 'studio:explorer:Edit-directory',
        },
        {
          label: 'Remove directory',
          icon: VscTrash,
          action: 'studio:explorer:remove-directory',
        },
      ]
    },
    {
      kind: 'file',
      defaultIcon: VscJson,
      label: 'File',
      actions: [
        {
          label: 'Edit file',
          icon: VscEdit,
          action: 'studio:explorer:edit-file',
        },
        {
          label: 'Remove file',
          icon: VscTrash,
          action: 'studio:explorer:remove-file',
        },
      ]
    }
  ]

  return (
    <div className='pb-3'>
      <TreeView id='studio:explorer:memory-file-system' items={items} details={details} />
    </div>
  );
};
