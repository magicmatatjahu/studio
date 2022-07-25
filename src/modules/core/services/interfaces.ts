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
  tabComponent: React.ElementType;
  contentComponent: React.ElementType;
  data: any;
}

export interface View {
  id: string;
  tabComponent: React.ElementType;
  contentComponent: React.ElementType;
}
