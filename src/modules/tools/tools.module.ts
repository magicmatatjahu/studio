import { Module } from "@adi/core";
import { VscExtensions } from 'react-icons/vsc';

import { ToolsManagerService } from "./services/tools-manager.service";

@Module({
  providers: [
    ToolsManagerService,
  ],
  exports: [
    ToolsManagerService,
    {
      provide: 'studio:activity-bar:element',
      useValue: {
        id: 'studio:tools',
        title: 'Tools',
        icon: VscExtensions,
      },
      annotations: {
        "adi:order": 0.01,
      }
    },
  ]
})
export class ToolsManager {}
