import { Module } from "@adi/core";

import { EventEmitterService } from "./services/event-emitter.service";

@Module({
  providers: [
    EventEmitterService,
  ],
  exports: [
    EventEmitterService,
  ]
})
export class EventsModule {}
