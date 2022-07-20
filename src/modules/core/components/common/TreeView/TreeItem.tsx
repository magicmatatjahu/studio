import { useContext, useState } from 'react';

import { TreeViewContext } from './TreeView';
import { TreeViewList } from './TreeViewList';
import { IconButton } from '../../../../ui/components/Button/IconButton';

import type { FunctionComponent } from 'react';
import type { TreeViewItem } from './interfaces';

interface TreeItemProps extends TreeViewItem {
  deep: number;
}

export const TreeItem: FunctionComponent<TreeItemProps> = (item) => {
  const { kind, content, items, deep } = item;

  const [expanded, setExpaned] = useState(false);
  const { details } = useContext(TreeViewContext);

  const itemKindDetails = details?.[kind];
  const itemKindActions = itemKindDetails?.actions;
  const additionalProps = itemKindDetails?.props?.(item) ?? {};
  const ItemDefaultIcon = itemKindDetails?.defaultIcon;
  const ItemExpandedIcon = itemKindDetails?.expandedIcon;
  const ItemCollapsedIcon = itemKindDetails?.collapsedIcon;

  return (
    <div>
      <div 
        {...additionalProps}
        className={`group ${additionalProps.className || ''} text-xs px-4 bg-gray-800 hover:bg-gray-700 cursor-pointer text-gray-300`}
      >
        <div className='flex flex-row items-center justify-between' onClick={() => setExpaned(expand => !expand)}>
          {deep ? Array.from(Array(deep).keys()).map((idx) => (
            <div className='flex-none border-l border-gray-600 py-[1.5px] text-[0px] ml-1.5 pl-1.5' key={idx}>l</div>
          )) : null}

          <div className='flex-1 flex flex-row items-center overflow-hidden py-[1.5px]'>
            {ItemExpandedIcon && ItemExpandedIcon ? (
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
            <div className='overflow-hidden whitespace-nowrap text-ellipsis'>
              {content}
            </div>
          </div>

          {itemKindActions ? (
            <div className='flex-none hidden group-hover:block'>
              <ul className='flex flex-row items-center'>
                {itemKindActions.map(action => (
                  <li className='flex flex-row items-center inline ml-0.5' key={action.label} title={action.label}>
                    <IconButton icon={action.icon} {...action.props?.(item) || {}} />
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
    </div>
  );
};
