import { BottomPanelTab } from './BottomPanelTab';

import type { FunctionComponent, Dispatch, SetStateAction } from 'react';
import type { BottomPanel as BottomPanelNamespace } from '../../interfaces';

interface BottomPanelTabsProps {
  elements: Array<BottomPanelNamespace.Element>;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export const BottomPanelTabs: FunctionComponent<BottomPanelTabsProps> = ({
  elements,
  activeTab,
  setActiveTab,
}) => {
  return (
    <ul className='flex overflow-y-hidden overflow-x-auto bg-gray-800 h-full'>
      {elements.map(element => (
        <li 
          key={element.id}
          className='flex justify-center items-center h-full mr-3'
          onClick={() => setActiveTab(element.id)}
        >
          <BottomPanelTab {...element} activeTab={activeTab} />
        </li>
      ))}
    </ul>
  );
}
