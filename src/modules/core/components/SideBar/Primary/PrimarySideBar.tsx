import { useInject } from '@adi/react';
import { useSelector } from 'react-redux';

import { FunctionComponent } from 'react';
import type { PrimarySideBar as PrimarySideBarNamespace } from '../../../interfaces';

interface PrimarySideBarProps {}

export const PrimarySideBar: FunctionComponent<PrimarySideBarProps> = () => {
  const views = useInject('studio:primary-sidebar:view') as Array<PrimarySideBarNamespace.Element>;
  const active = useSelector<any>(state => state['studio:state:navigation']['studio:activity-bar:active']);

  return (
    <div className='flex flex-none flex-col overflow-y-auto overflow-x-hidden bg-gray-800 h-full relative'>
      {views.map(view => {
        return (
          <div className={`flex flex-col ${active === view.id ? 'block' : 'hidden'}`} key={view.id}>
            <view.component />
          </div>
        )
      })}
    </div>
  );
}
