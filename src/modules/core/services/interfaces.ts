export interface Panel {
  id: string;
  visible: boolean;
  tabs: PanelTab[];
  activeTab: string;
}

export interface PanelTab {
  id: string;
  panelId: string;
  viewId: string,
  tab: React.ElementType;
  content: React.ElementType;
  data: any;
}

export interface View {
  id: string;
  tab: React.ElementType;
  content: React.ElementType;
}
