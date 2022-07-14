import { useInject } from '@adi/react';
import { useDispatch, useSelector } from 'react-redux';

import type { FunctionComponent } from 'react';
import type { ActivityBar as ActivityBarNamespace } from '../../interfaces';

interface ActivityBarProps {}

export const ActivityBar: FunctionComponent<ActivityBarProps> = () => {
  const elements = useInject('studio:activity-bar:element') as Array<ActivityBarNamespace.Element>;
  // TODO: FIX REDUCERS DEEP
  const active = useSelector<any>(state => state['studio:state:navigation']['studio:activity-bar:active']);
  const dispatch = useDispatch();

  return (
    <div className='flex flex-col bg-zinc-800 justify-between w-12'>
      <ul className="flex flex-col w-full h-full">
        {elements.map(element => (
          <li 
            className='w-full'
            key={element.id}
          >
            <button
              onClick={() => dispatch({ type: 'studio:activity-bar:active', payload: element.id })}
              className={`flex text-sm border-l-2 text-white focus:outline-none border-box p-3 w-full ${
                active === element.id ? 'text-white border-pink-500'
                  : 'text-gray-500 hover:text-white border-zinc-800'
              }`}
              type="button"
            >
              <element.icon className="w-full h-full" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
