import { Module } from "@adi/core";

import { NavigationService } from "./navigation.service";
import { NavigationReducer } from "./navigation.reducer";

@Module({
  providers: [
    NavigationService,
  ],
  exports: [
    NavigationService,
    {
      provide: 'studio:state:reducer',
      useClass: NavigationReducer,
    }
  ]
})
export class NavigationModule {}
