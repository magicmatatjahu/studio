import { useEffect } from 'react';

import { useStudio } from '@/hooks';

import type { event, eventNS, OnOptions, ListenerFn } from 'eventemitter2';

export function useListener(event: event | eventNS, listenerFn: ListenerFn, options?: boolean | Exclude<OnOptions, 'objectify'>) {
  const { events } = useStudio();

  useEffect(() => {
    const listener = events.subscribe(event, listenerFn, options);
    return () => {
      listener.unsubscribe();
    }
  }, []);
}
