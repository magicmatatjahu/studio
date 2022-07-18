import { Module } from "@adi/core";

import { PanelsManager } from "./services/panels-manager.service";
import { PanelsReducer } from "./services/panels.reducer";
import { providers } from "./core.providers";

@Module({
  providers: [
    PanelsManager,
  ],
  exports: [
    {
      provide: 'studio:state:reducer',
      useClass: PanelsReducer,
    },
    PanelsManager,
    ...providers,
  ]
})
export class CoreModule {}