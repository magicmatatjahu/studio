import React, { useState } from 'react';
import { VscChevronRight, VscChevronDown } from 'react-icons/vsc';

import { IconButton } from '../IconButton';

interface ExpandedPanelProps {
  title: string;
  opened?: boolean;
  actions?: React.ReactNode[];
}

export const ExpandedPanel: React.FunctionComponent<ExpandedPanelProps> = (panel) => {
  const { title, opened = true, actions, children } = panel;

  const [open, setOpen] = useState(opened);
  const [hover, setHover] = useState(false);

  return (
    <div 
      className="flex flex-col border-b border-gray-700" 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div 
        className="flex flex-row items-center justify-between bg-gray-800 hover:bg-gray-700 cursor-pointer text-xs leading-6 text-gray-300 pl-1 pr-2"
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
              {actions.map((action, idx) => (
                <li className='flex flex-row items-center inline ml-1 text-sm' key={idx}>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      
      <div className={open ? 'block' : 'hidden'}>
        {children}
      </div>
    </div>
  );
};