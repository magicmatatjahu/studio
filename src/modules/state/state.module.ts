import { INITIALIZERS, Module } from "@adi/core";

import { StateService } from "./state.service";
import { ReducerManagerService } from "./reducer-manager.service";
import { stateProviders } from "./state.providers";

@Module({
  providers: [
    StateService,
    ReducerManagerService,
    {
      provide: INITIALIZERS,
      useExisting: StateService,
    }
  ],
  exports: [
    StateService,
    ...stateProviders,
  ]
})
export class StateModule {}
