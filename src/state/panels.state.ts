import create from 'zustand';
import { persist } from 'zustand/middleware';

export type PanelTab = {
  name: string;
  metadata: any;
}

export type PanelsState = {
  show: {
    activityBar: boolean;
    statusBar: boolean;
    primarySidebar: boolean;
    secondarySidebar: boolean;
    primaryPanel: boolean;
    secondaryPanel: boolean;
    contextPanel: boolean;
  };
  primaryTabs: Array<PanelTab>;
  secondaryTabs: Array<PanelTab>;
  // TODO: remove when panels tabs will be introduced
  secondaryPanelType: 'template' | 'visualiser';
}

export const panelsState = create(
  persist<PanelsState>(() => 
    ({
      show: {
        activityBar: true,
        statusBar: true,
        primarySidebar: true,
        secondarySidebar: true,
        primaryPanel: true,
        secondaryPanel: true,
        contextPanel: true,
      },
      primaryTabs: [],
      secondaryTabs: [],
      secondaryPanelType: 'template',
    }), 
    {
      name: 'studio-panels',
      getStorage: () => localStorage,
    }
  ),
);

export const usePanelsState = panelsState;