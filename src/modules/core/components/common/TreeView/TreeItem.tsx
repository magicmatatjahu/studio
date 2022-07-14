import { useContext, useState } from 'react';
import { VscChevronDown, VscChevronRight, VscPlug } from 'react-icons/vsc';

import { TreeViewContext } from './TreeView';
import { TreeViewList } from './TreeViewList';
import { IconButton } from '../../../../ui/components/Button/IconButton';

import type React from 'react';
import type { TreeViewItem } from './interfaces';

interface TreeItemProps extends TreeViewItem {
  deep: number;
}

export const TreeItem: React.FunctionComponent<TreeItemProps> = (item) => {
  const { kind, content, items, deep } = item;

  const [expanded, setExpaned] = useState(false);
  const { details } = useContext(TreeViewContext);

  const itemKindDetails = details?.[kind];
  const itemKindActions = itemKindDetails?.actions;
  const additionalProps = itemKindDetails?.compProps?.(item) ?? {};
  const hasItems = items ? items.length > 0 : false;
  const ItemDefaultIcon = itemKindDetails?.defaultIcon;
  const ItemExpandedIcon = itemKindDetails?.expandedIcon;
  const ItemCollapsedIcon = itemKindDetails?.collapsedIcon;

  return (
    <>
      <div 
        {...additionalProps}
        className={`group ${additionalProps.className || ''} text-xs pr-4 bg-gray-800 hover:bg-gray-700 cursor-pointer text-gray-300`}
        style={{ ...additionalProps.style || {}, paddingLeft: `${1 + deep * 1}rem` }}
      >
        <div className='flex flex-row items-center justify-between py-[1px]' onClick={() => setExpaned(expand => !expand)}>
          <div className='flex flex-row items-center'>
            {hasItems ? (
              <button className="inline-block mr-1">
                {expanded ? (
                  ItemExpandedIcon ? <ItemExpandedIcon /> : <ItemDefaultIcon />
                ) : (
                  ItemCollapsedIcon ? <ItemCollapsedIcon /> : <ItemDefaultIcon />
                )}
              </button>
            ) : null}

            {ItemExpandedIcon || ItemCollapsedIcon ? null : (
              <div className='mr-1'>
                <ItemDefaultIcon />
              </div>
            )}
            <div>
              {content}
            </div>
          </div>

          {itemKindActions ? (
            <div className='hidden group-hover:block'>
              <ul className='flex flex-row items-center'>
                {itemKindActions.map(action => (
                  <li className='flex flex-row items-center inline ml-0.5' key={action.label} title={action.label}>
                    <IconButton icon={action.icon} {...action.compProps?.(item) || {}} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
      <div className={expanded ? 'block': 'hidden'}>
        <TreeViewList items={items} deep={deep + 1} />
      </div>
    </>
  );
};
