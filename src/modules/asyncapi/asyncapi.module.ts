import { INITIALIZERS, Module } from "@adi/core";

import { AsyncAPIService } from "./asyncapi.service";
import { AsyncAPIMonacoService } from "./asyncapi-monaco.service";
import { AsyncAPIParserService } from "./asyncapi-parser.service";

@Module({
  providers: [
    AsyncAPIService,
    AsyncAPIMonacoService,
    AsyncAPIParserService,
    {
      provide: INITIALIZERS,
      useExisting: AsyncAPIMonacoService,
    },
    {
      provide: INITIALIZERS,
      useExisting: AsyncAPIParserService,
    }
  ],
  exports: [
    AsyncAPIService,
  ]
})
export class AsyncAPIModule {}
