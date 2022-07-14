import { All, Optional } from "@adi/core";

import type { Provider } from "@adi/core";

export const stateProviders: Array<Provider> = [
  {
    provide: 'studio:state:reducer',
    hooks: [Optional([]), All()],
  },
];