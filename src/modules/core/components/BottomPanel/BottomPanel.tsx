import { useInject } from '@adi/react';
import { useEffect, useState } from 'react';

import { BottomPanelTabs } from './BottomPanelTabs';

import type { FunctionComponent } from 'react';
import type { BottomPanel as BottomPanelNamespace } from '../../interfaces';

interface BottomPanelProps {}

export const BottomPanel: FunctionComponent<BottomPanelProps> = () => {
  const [activeTab, setActiveTab] = useState<string>('');
  const elements = useInject<BottomPanelNamespace.Element[]>('studio:bottom-panel:element') || [];

  useEffect(() => {
    if (!activeTab && elements.length) {
      setActiveTab(elements[0].id);
    }
  }, [elements]);

  if (!elements.length) {
    return (
      <div className='flex flex-none flex-col overflow-y-auto overflow-x-hidden bg-gray-800 h-full' />
    );
  }

  return (
    <div className='flex flex-none flex-col overflow-y-auto overflow-x-hidden bg-gray-800 h-full py-2.5'>
      <div className='flex flex-col h-full'>
        <div className='flex-none flex flex-row border-b border-gray-800 px-4'>
          <BottomPanelTabs elements={elements} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="flex-1 relative h-full">
          <ul>
            {elements.map(element => (
              <li
                key={element.id}
                className={`absolute overflow-auto h-auto top-0 bottom-0 right-0 left-0 ${activeTab === element.id ? 'block' : 'hidden'}`}
              >
                <div className='flex flex-none flex-col overflow-y-auto overflow-x-hidden bg-gray-800 h-full'>
                  <element.contentComponent />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
