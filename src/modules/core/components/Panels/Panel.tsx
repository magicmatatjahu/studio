import { useInject } from '@adi/react';
import { useState } from 'react';
import { VscSplitHorizontal, VscAdd } from 'react-icons/vsc';
import { GoKebabHorizontal } from 'react-icons/go';

import { PanelTabs } from './PanelTabs';
import { IconButton } from '../../../ui/components/Button/IconButton';

import { PanelsManager } from '../../services/panels-manager.service';

import { useListener } from '../../../ui/hooks/useListener';

import type { FunctionComponent } from 'react';
import type { Panel as PanelInterface } from '../../services/interfaces';

interface PanelProps extends PanelInterface {}

export const Panel: FunctionComponent<PanelProps> = (_panel) => {
  const panelsManager = useInject(PanelsManager);
  const [activePanel, setActivePanel] = useState<string>(panelsManager.getActivePanel());
  const [panel, setPanel] = useState<PanelInterface>(_panel);

  useListener('studio:panels:set-active-panel', (payload) => {
    setActivePanel(payload.panel.id);
  });

  useListener('studio:panels:update-panel', (payload) => {
    if (panel.id === payload.panel.id) {
      setPanel({ ...payload.panel });
    }
  });

  return (
    <div className="h-full min-h-full bg-gray-800 relative">
      <div 
        className='flex flex-col h-full min-h-full relative'
        onClick={() => panelsManager.setActivePanel(_panel.id)}
      >
        <div className='flex-none flex flex-row justify-between items-center border-b border-gray-700 w-full h-6 text-xs'>
          <div className={`flex-none h-full ${_panel.id === activePanel ? 'opacity-1' : 'opacity-50'}`}>
            <PanelTabs panel={panel} panelsManager={panelsManager} />
          </div>

          <div className='flex-none flex flex-row items-center justify-center h-full ml-1'>
            <IconButton 
              icon={VscAdd}
              onClick={(e) => {
                e.stopPropagation();
                panelsManager.createDefaultTab(_panel.id);
              }}
            />
          </div>

          <div 
            className='flex-1 w-full h-full cursor-pointer'
            onDoubleClick={(e) => {
              e.stopPropagation();
              panelsManager.createDefaultTab(_panel.id);
            }}
          />

          <div className='flex-none border-l border-gray-700 h-full'>
            <ul className='flex flex-row items-center h-full p-1'>
              <li>
                <IconButton icon={VscSplitHorizontal} onClick={() => panelsManager.createPanel(_panel.id)} />
              </li>
              <li className='ml-1'>
                <IconButton icon={GoKebabHorizontal} />
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-1 relative">
          <ul>
            {panel.tabs.map(tab => (
              <li
                key={tab.id}
                className={`absolute overflow-auto h-auto top-0 bottom-0 right-0 left-0 ${panel.activeTab === tab.id ? 'block' : 'hidden'}`}
              >
                {tab.id}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
