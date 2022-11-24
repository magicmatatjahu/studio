import { appState, useAppState } from './app.state';
import { documentsState, useDocumentsState } from './documents.state';
import { fileSystemState, useFileSystemState } from './file-system.state';
import { panelsState, usePanelsState } from './panels.state';
import { settingsState, useSettingsState } from './settings.state';

export { 
  appState, useAppState,
  documentsState, useDocumentsState,
  fileSystemState, useFileSystemState,
  panelsState, usePanelsState,
  settingsState, useSettingsState,
};

const state = {
  // app
  app: appState,
  useAppState,

  // documents
  documents: documentsState,
  useDocumentsState,

  // file-system
  fileSystem: fileSystemState,
  useFileSystemState,

  // panels
  panels: panelsState,
  usePanelsState,

  // settings
  settings: settingsState,
  useSettingsState,
};

export default state;
