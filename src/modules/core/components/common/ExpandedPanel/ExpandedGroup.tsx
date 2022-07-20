import { ExpandedPanel } from './ExpandedPanel';

import { IconButton } from '../../../../ui/components/Button/IconButton';

import type { FunctionComponent } from 'react';
import type { ExpandedGroup as ExpandedGroupInterface } from './interfaces';

interface ExpandedGroupProps extends ExpandedGroupInterface {}

export const ExpandedGroup: FunctionComponent<ExpandedGroupProps> = (group) => {
  const { title, panels, actions } = group;

  return (
    <div className="flex flex-col">
      <div className='flex flex-row items-center justify-between'>
        <h2 className="p-2 text-gray-500 text-xs uppercase">
          {title}
        </h2>

        {actions ? (
          <div className='flex-none hidden group-hover:block'>
            <ul className='flex flex-row items-center'>
              {actions.map(action => (
                <li className='flex flex-row items-center inline ml-0.5' key={action.label} title={action.label}>
                  <IconButton icon={action.icon} {...action.props?.(group) || {}} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className='w-full'>
        {panels.map(panel => (
          <div key={panel.id}>
            <ExpandedPanel {...panel} />
          </div>
        ))}
      </div>
    </div>
  );
};
