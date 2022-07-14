import { Module } from "@adi/core";

import { AsyncAPIService } from "./asyncapi.service";

@Module({
  providers: [
    AsyncAPIService,
  ],
  exports: [
    AsyncAPIService,
  ]
})
export class AsyncAPIModule {}
