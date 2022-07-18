export interface Panel {
  id: string;
  visible: boolean;
  tabs: PanelTab[];
  activeTab: string;
}

export interface PanelTab {
  id: string;
  panelId: string;
  toolId: string,
  tab: React.ReactNode;
  content: React.ReactNode;
}