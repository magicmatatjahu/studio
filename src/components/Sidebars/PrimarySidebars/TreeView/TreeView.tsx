import React from 'react';

import { TreeViewItem } from './TreeViewItem';

import type { File } from '../../../../services/file-system/abstract-file-system.service';

interface TreeViewProps {
  files?: Array<File>;
  deep?: number;
}

export const TreeView: React.FunctionComponent<TreeViewProps> = ({
  files = [],
  deep = 0,
}) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <ul>
      {files.map(file => (
        <li key={file.uriString}>
          <TreeViewItem file={file} deep={deep} />
        </li>
      ))}
    </ul>
  )
};