import type { FunctionComponent } from 'react';

interface SecondarySideBarProps {}

export const SecondarySideBar: FunctionComponent<SecondarySideBarProps> = () => {
  return (
    <div className='flex flex-none flex-col overflow-y-auto overflow-x-hidden border-l border-gray-700 bg-gray-800 h-full'>
      siderbar
    </div>
  );
}
