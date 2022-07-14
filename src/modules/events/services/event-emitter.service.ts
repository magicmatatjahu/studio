import { Injectable, SingletonScope } from "@adi/core";
import EventEmitter2 from "eventemitter2";

import type { event, eventNS, OnOptions, ListenerFn, Listener } from 'eventemitter2';

@Injectable({
  scope: SingletonScope,
})
export class EventEmitterService extends EventEmitter2 {
  subscribe(event: event | eventNS, listenerFn: ListenerFn, options?: boolean | Exclude<OnOptions, 'objectify'>) {
    const listener = this.on(event, listenerFn, this.serializeOptions(options)) as Listener;
    return {
      unsubscribe() {
        listener.off();
      }
    }
  }

  private serializeOptions(options?: boolean | Exclude<OnOptions, 'objectify'>): OnOptions {
    if (options === true) {
      return { promisify: true, objectify: true };
    }
    if (options === false) {
      return { async: true, objectify: true };
    }
    return options ? { ...options, objectify: true } : { objectify: true };
  }
}
