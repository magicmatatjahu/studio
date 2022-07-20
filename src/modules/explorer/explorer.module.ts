import { Module } from "@adi/core";
import { VscFiles } from 'react-icons/vsc';

import { BrowserFileSystemExplorer } from './services/browser-filesystem-explorer.service';

import { PrimarySideBarView } from './components/PrimarySideBarView';

@Module({
  providers: [
    BrowserFileSystemExplorer
  ],
  exports: [
    BrowserFileSystemExplorer,
    {
      provide: 'studio:activity-bar:element',
      useValue: {
        id: 'studio:explorer',
        title: 'Explorer',
        icon: VscFiles,
      },
      annotations: {
        "adi:order": 0,
      }
    },
    {
      provide: 'studio:primary-sidebar:view',
      useValue: {
        id: 'studio:explorer',
        component: PrimarySideBarView,
      },
    },
  ]
})
export class ExplorerModule {}
