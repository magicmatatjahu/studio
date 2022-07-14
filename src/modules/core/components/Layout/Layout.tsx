import { Allotment } from "allotment";

import { ActivityBar } from '../ActivityBar/ActivityBar';
import { BottomPanel } from '../BottomPanel/BottomPanel';
import { PanelGroups } from '../Panels/PanelGroups';
import { PrimarySideBar } from '../SideBar/Primary/PrimarySideBar';
import { SecondarySideBar } from '../SideBar/Secondary/SecondarySideBar';
import { NavBar } from '../NavBar/NavBar';
import { StatusBar } from '../StatusBar/StatusBar';

import type { FunctionComponent } from 'react';

interface LayoutProps {}

export const Layout: FunctionComponent<LayoutProps> = () => {
  return (
    <div className="flex flex-col h-full w-full h-screen">
      <div>
        <NavBar />
      </div>

      <div className="flex flex-row flex-1 overflow-hidden">
        <ActivityBar />

        <Allotment defaultSizes={[1, 5, 1]}>
          <Allotment.Pane minSize={150} snap={true}>
            <PrimarySideBar />
          </Allotment.Pane>

          <Allotment.Pane minSize={150}>
            <Allotment defaultSizes={[3, 1]} vertical={true}>
              <Allotment.Pane>
                <PanelGroups />
              </Allotment.Pane>
              <Allotment.Pane minSize={150} snap={true}>
                <BottomPanel />
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>

          <Allotment.Pane minSize={150} snap={true} visible={false}>
            <SecondarySideBar />
          </Allotment.Pane>
        </Allotment>
      </div>

      <div>
        <StatusBar />
      </div>
    </div>
  );
}
