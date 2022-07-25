import type React from "react";

export namespace ActivityBar {
  export interface Element {
    id: string;
    title: string;
    icon: React.ElementType;
  }
}

export namespace PrimarySideBar {
  export interface Element {
    id: string;
    component: React.ElementType;
  }
}

export namespace SecondarySideBar {
  export interface Element {
    id: string;
    component: React.ElementType;
  }
}

export namespace BottomPanel {
  export interface Element {
    id: string;
    tabComponent: React.ElementType;
    contentComponent: React.ElementType;
    actions: BottomPanel.Action[];
  }

  export interface Action {
    label: string;
    icon: React.ElementType;
    props?: (panel: BottomPanel.Element) => React.DetailedHTMLProps<React.HTMLAttributes<any>, any>;
  }
}
