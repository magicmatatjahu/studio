import create from 'zustand';
import { persist } from 'zustand/middleware';
import { mergePatch } from '@asyncapi/parser/cjs/utils';

export type SettingsState = {
  editor: {
    autoSaving: boolean;
    savingDelay: number;
  };
  governance: {
    show: {
      warnings: boolean;
      informations: boolean;
      hints: boolean;
    }
  };
  templates: {
    autoRendering: boolean;
  };
}

export const settingsState = create(
  persist<SettingsState>(_ => 
    ({
      editor: {
        autoSaving: true,
        savingDelay: 625,
      },
      governance: {
        show: {
          warnings: true,
          informations: true,
          hints: true,
        },
      },
      templates: {
        autoRendering: true,
      },
    }), 
    {
      name: 'studio-settings',
      getStorage: () => localStorage,
      merge: (persistedState, currentState) => {
        return mergePatch(currentState, persistedState);
      },
    }
  ),
);

export const useSettingsState = settingsState;