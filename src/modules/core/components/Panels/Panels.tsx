import { useInject } from '@adi/react';
import { useState } from 'react';

import { Allotment } from "allotment";
import { Panel } from './Panel';

import { PanelsManager } from '../../services/panels-manager.service';

import { useListener } from '@/hooks';

import type { FunctionComponent } from 'react';
import type { Panel as PanelInterface } from '../../services/interfaces';

interface PanelsProps {}

export const Panels: FunctionComponent<PanelsProps> = () => {
  const panelManager = useInject(PanelsManager);
  const [panels, setPanels] = useState<Array<PanelInterface>>(panelManager.getPanels());

  useListener('studio:panels:**', () => {
    setPanels([...panelManager.getPanels()]);
  });

  if (panels.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-none flex-col overflow-y-auto overflow-x-hidden bg-gray-800 h-full'>
      <Allotment>
        {panels.map(panel => (
          <Allotment.Pane minSize={150} key={panel.id}>
            <Panel {...panel} />
          </Allotment.Pane>
        ))}
      </Allotment>
    </div>
  );
}
