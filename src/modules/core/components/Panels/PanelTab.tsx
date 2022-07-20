import { VscChromeClose } from 'react-icons/vsc';

import { IconButton } from '../../../ui/components/Button/IconButton';

import type { FunctionComponent } from 'react';
import type { PanelsManager } from '../../services/panels-manager.service';
import type { PanelTab as PanelTabInterface } from '../../services/interfaces';

interface PanelTabPops extends PanelTabInterface {
  activeTab: string;
  panelsManager: PanelsManager;
}

export const PanelTab: FunctionComponent<PanelTabPops> = ({
  id,
  activeTab,
  panelsManager,
}) => {
  const activeClassName = activeTab === id
    ? 'border-t-pink-500'
    : 'border-t-gray-800';

  return (
    <div className={`group flex flex-row items-center justify-center bg-gray-800 h-full px-2 border-t-2 border-b-2 border-b-gray-800 focus:outline-none border-box cursor-pointer ${activeClassName}`}>
      <span className='text-gray-300'>
        lol
      </span>
      <IconButton 
        icon={VscChromeClose} 
        className='ml-1 text-gray-800 group-hover:text-gray-300'
        onClick={(e) => {
          e.stopPropagation();
          panelsManager.removeTab(id);
        }}
      />
    </div>
  );
}
