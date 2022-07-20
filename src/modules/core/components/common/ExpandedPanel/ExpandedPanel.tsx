import { useState } from 'react';
import { VscChevronRight, VscChevronDown } from 'react-icons/vsc';

import { IconButton } from '../../../../ui/components/Button/IconButton';

import type { FunctionComponent } from 'react';
import type { ExpandedPanel as ExpandedPanelInterface } from './interfaces';

interface ExpandedPanelProps extends ExpandedPanelInterface {}

export const ExpandedPanel: FunctionComponent<ExpandedPanelProps> = (panel) => {
  const { title, opened = false, component, actions } = panel;

  const [open, setOpen] = useState(opened);
  const [hover, setHover] = useState(false);
  const Component = component;

  return (
    <div 
      className="flex flex-col" 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div 
        className="flex flex-row items-center justify-between bg-gray-800 hover:bg-gray-700 border-b border-zinc-700 cursor-pointer text-xs leading-6 text-gray-300 pl-1 pr-2"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(oldState => !oldState);
        }}
      >
        <button className="flex-none inline-block mr-1">
          {open ? (
            <VscChevronDown />
          ) : (
            <VscChevronRight />
          )}
        </button>
          
        <h3 className="flex-1 uppercase inline-block font-bold overflow-hidden whitespace-nowrap text-ellipsis">{title}</h3>

        {actions ? (
          <div className={`flex-none ${hover ? 'block' : 'hidden'}`}>
            <ul className='flex flex-row items-center'>
              {actions.map(action => (
                <li className='flex flex-row items-center inline ml-0.5 text-sm' key={action.label} title={action.label}>
                  <IconButton icon={action.icon} {...action.props?.(panel) || {}} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      
      <div className={open ? 'block' : 'hidden'}>
        <Component />
      </div>
    </div>
  );
};