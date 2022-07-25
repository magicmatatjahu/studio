import { useInject } from '@adi/react';
import { Provider } from 'react-redux';

import { StateService } from './modules/state/state.service';

import { Layout } from './modules/core/components/Layout/Layout';

import { StudioContext, prepareStudioContextValue } from '@/contexts';

export function App() {
  const studioContextValue = prepareStudioContextValue();
  const stateService = useInject(StateService);

  return (
    <StudioContext.Provider value={studioContextValue}>
      <Provider store={stateService.getStore()}>
        <Layout />
      </Provider>
    </StudioContext.Provider>
  );
}
