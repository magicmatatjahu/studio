import { useState } from 'react';
import { VscChevronRight, VscChevronDown } from 'react-icons/vsc';

import type React from 'react';

interface ExpandedPanelProps extends React.PropsWithChildren {
  title: string;
  menu?: React.ReactNode
  opened?: boolean;
}

export const ExpandedPanel: React.FunctionComponent<ExpandedPanelProps> = ({
  title,
  menu,
  opened = false,
  children,
}) => {
  const [open, setOpen] = useState(opened);
  const [hover, setHover] = useState(false);

  return (
    <div 
      className="flex flex-col" 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div 
        className="flex flex-row justify-between bg-gray-800 hover:bg-gray-700 border-b border-zinc-700 cursor-pointer text-xs leading-6 text-gray-300 pl-1 pr-2"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(oldState => !oldState);
        }}
      >
        <div className='flex flex-row items-center overflow-hidden'>
          <button className="inline-block mr-1">
            {open ? (
              <VscChevronDown />
            ) : (
              <VscChevronRight />
            )}
          </button>
          <h3 className="uppercase inline-block font-bold overflow-hidden whitespace-nowrap text-ellipsis">{title}</h3>
        </div>

        <div className={hover ? 'block' : 'hidden'}>
          {menu}
        </div>
      </div>
      <div className={open ? 'block' : 'hidden'}>
        {children}
      </div>
    </div>
  );
};