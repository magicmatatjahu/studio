import { Module } from "@adi/core";

import { providers } from "./core.providers";

@Module({
  exports: [
    ...providers,
  ]
})
export class CoreModule {}