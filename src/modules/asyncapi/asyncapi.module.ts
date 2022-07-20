import { INITIALIZERS, Module } from "@adi/core";

import { AsyncAPIService } from "./asyncapi.service";
import { AsyncAPIMonacoService } from "./asyncapi-monaco.service";

@Module({
  providers: [
    AsyncAPIService,
    AsyncAPIMonacoService,
    {
      provide: INITIALIZERS,
      useClass: AsyncAPIMonacoService,
    }
  ],
  exports: [
    AsyncAPIService,
    AsyncAPIMonacoService,
  ]
})
export class AsyncAPIModule {}
