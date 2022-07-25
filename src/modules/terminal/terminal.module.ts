import { Module } from "@adi/core";

import { ProblemsTab } from "./components/ProblemsTab";
import { ProblemsTree } from "./components/ProblemsTree";

import { ProblemsManager } from "./services/problems-manager.service";

@Module({
  providers: [
    ProblemsManager,
  ],
  exports: [
    ProblemsManager,
    {
      provide: 'studio:bottom-panel:element',
      useValue: {
        id: 'studio:problems',
        tabComponent: ProblemsTab,
        contentComponent: ProblemsTree,
        actions: [],
      }
    },
  ]
})
export class TerminalModule {}
