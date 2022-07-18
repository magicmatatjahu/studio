import { All, Optional } from "@adi/core";

import type { Provider } from "@adi/core";

export const providers: Array<Provider> = [
  {
    provide: 'studio:activity-bar:element',
    hooks: [Optional([]), All()],
  },
  {
    provide: 'studio:primary-sidebar:view',
    hooks: [Optional([]), All()],
  },
  {
    provide: 'studio:status-bar:element',
    hooks: [Optional([]), All()],
  },
  {
    provide: 'studio:views:element',
    hooks: [Optional([]), All()],
  },
];