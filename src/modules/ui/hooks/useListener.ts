import { useInject } from '@adi/react';
import { useEffect } from 'react';

import { EventEmitterService } from "../../events/services/event-emitter.service";

import type { event, eventNS, OnOptions, ListenerFn } from 'eventemitter2';

export function useListener(event: event | eventNS, listenerFn: ListenerFn, options?: boolean | Exclude<OnOptions, 'objectify'>) {
  const eventEmitter = useInject(EventEmitterService);
  useEffect(() => {
    const listener = eventEmitter.subscribe(event, listenerFn, options);
    return () => {
      listener.unsubscribe();
    }
  }, []);
}
