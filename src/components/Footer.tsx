import React from 'react';
import { VscScreenFull, VscScreenNormal, VscRadioTower } from 'react-icons/vsc';

import state from '../state';

interface FooterProps {}

export const Footer: React.FunctionComponent<FooterProps> = () => {
  const appState = state.useAppState();
  const sidebarState = state.useSidebarState();

  const liveServer = appState.liveServer.get();
  const sidebarMode = sidebarState.mode;

  return (
    <div className='flex flex-row justify-between bg-pink-500 text-gray-100 px-2.5 h-6'>
      <div>
        <ul className='flex flex-row h-full'>
          <li 
            className='p-1 hover:bg-pink-400 cursor-pointer'
            onClick={() => sidebarMode.set(sidebarMode.get() === 'collapsed' ? 'expanded' : 'collapsed')}
          >
            {sidebarMode.get() === 'collapsed' ? (
              <VscScreenFull className='w-4 h-4' />
            ) : (
              <VscScreenNormal className='w-4 h-4' />
            )}
          </li>
        </ul>
      </div>
      <div>
        <ul className='flex flex-row h-full'>
          {!liveServer && (
            <li 
              className='p-1 hover:bg-pink-400 cursor-pointer'
            >
              <VscRadioTower className='w-4 h-4' />
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
