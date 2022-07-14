import { Module } from "@adi/core";

import { CommandsService } from "./commands.service";

@Module({
  providers: [
    CommandsService,
  ],
  exports: [
    CommandsService,
  ]
})
export class CommandsModule {}
