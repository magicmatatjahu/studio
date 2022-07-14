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