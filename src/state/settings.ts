import { createState, useState } from '@hookstate/core';

export interface SettingsState {
  showModal: boolean;
  activeTab: string;
}

export const settingsState = createState<SettingsState>({
  showModal: false,
  activeTab: 'Editor',
});

export function useSettingsState() {
  return useState(settingsState);
}
