import { VscTrash, VscEdit, VscFolder, VscFolderOpened, VscFile, VscNewFile, VscNewFolder, VscJson } from 'react-icons/vsc';

import { TreeView } from '../../core/components/common/TreeView/TreeView';

import type React from 'react';
import type { TreeViewItem, TreeViewItemDetail } from '../../core/components/common/TreeView/interfaces';

interface MemoryFileSystemProps {}

export const MemoryFileSystem: React.FunctionComponent<MemoryFileSystemProps> = () => {
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
        {
          id: '8',
          kind: 'file',
          label: 'first dir',
          content: "first dir"
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
        },
        {
          label: 'Create directory',
          icon: VscNewFolder,
        },
        {
          label: 'Edit directory',
          icon: VscEdit,
        },
        {
          label: 'Remove directory',
          icon: VscTrash,
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
        },
        {
          label: 'Remove file',
          icon: VscTrash,
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
