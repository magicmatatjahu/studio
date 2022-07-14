import { TreeItem } from './TreeItem';

import type React from 'react';
import type { TreeViewItem } from './interfaces';

interface TreeViewListProps {
  deep: number;
  items?: Array<TreeViewItem>;
}

export const TreeViewList: React.FunctionComponent<TreeViewListProps> = ({
  deep,
  items = [],
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <TreeItem {...item} deep={deep} />
        </li>
      ))}
    </ul>
  )
}