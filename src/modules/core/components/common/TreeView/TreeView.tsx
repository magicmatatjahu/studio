import { useMemo, createContext } from 'react';

import { TreeViewList } from './TreeViewList';

import type React from 'react';
import type { TreeViewItem, TreeViewItemDetail } from './interfaces';

interface TreeViewProps {
  id: string;
  items?: Array<TreeViewItem>;
  details?: Array<TreeViewItemDetail>;
}

export const TreeViewContext = createContext<{
  id: string,
  details: Record<string, TreeViewItemDetail>,
}>({} as any);

export const TreeView: React.FunctionComponent<TreeViewProps> = ({
  id,
  items = [],
  details = [],
}) => {
  const serializedDetails = useMemo(() => {
    return details.reduce((all, current) => {
      all[current.kind] = current;
      return all;
    }, {} as Record<string, TreeViewItemDetail>);
  },[details]);

  return (
    <TreeViewContext.Provider value={{ id, details: serializedDetails, }}>
      <div className="flex flex-col">
        <TreeViewList items={items} deep={0} />
      </div>
    </TreeViewContext.Provider>
  );
};
