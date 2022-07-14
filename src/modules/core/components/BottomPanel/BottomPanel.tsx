import type { FunctionComponent } from 'react';

interface BottomPanelProps {}

export const BottomPanel: FunctionComponent<BottomPanelProps> = () => {
  return (
    <div className='flex flex-none flex-col overflow-y-auto overflow-x-hidden bg-gray-800 h-full'>
      bottom panel
    </div>
  );
}
