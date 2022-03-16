import { createState, useState } from '@hookstate/core';

export interface SidebarState {
  show: boolean;
  mode: 'collapsed' | 'expanded';
  panels: {
    newFile: boolean;
    navigation: boolean;
    editor: boolean;
    view: boolean;
    viewType: 'template' | 'visualiser';
  };
}

export const sidebarState = createState<SidebarState>({
  show: true,
  mode: 'expanded',
  panels: {
    newFile: false,
    navigation: true,
    editor: true,
    view: true,
    viewType: 'template',
  },
});

export function useSidebarState() {
  return useState(sidebarState);
}
