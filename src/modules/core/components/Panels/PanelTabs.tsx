import { PanelTab } from './PanelTab';

import type { FunctionComponent } from 'react';
import type { PanelsManager } from '../../services/panels-manager.service';
import type { Panel } from '../../services/interfaces';

interface PanelTabsProps {
  panel: Panel;
  panelsManager: PanelsManager;
}

export const PanelTabs: FunctionComponent<PanelTabsProps> = ({
  panel,
  panelsManager,
}) => {
  return (
    <ul className='flex overflow-y-hidden overflow-x-auto bg-gray-800 h-full'>
      {panel.tabs.map(tab=> (
        <li 
          key={tab.id}
          className='flex justify-center items-center border-r border-gray-700 h-full'
          onClick={() => panelsManager.setActiveTab(tab.id)}
        >
          <PanelTab {...tab} activeTab={panel.activeTab} panelsManager={panelsManager} />
        </li>
      ))}
    </ul>
  );
}
