import { useInject } from '@adi/react';
import { Provider } from 'react-redux';

import { StateService } from './modules/state/state.service';

import { Layout } from './modules/core/components/Layout/Layout';

export function App() {
  const stateService = useInject(StateService);

  return (
    <Provider store={stateService.getStore()}>
      <Layout />
    </Provider>
  );
}
