import { Module, INITIALIZERS } from "@adi/core";

import { MonacoService } from "./services/monaco.service";

@Module({
  providers: [
    MonacoService,
    {
      provide: INITIALIZERS,
      useClass: MonacoService,
    }
  ],
  exports: [
    MonacoService,
  ]
})
export class MonacoModule {}
