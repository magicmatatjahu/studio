import type { FunctionComponent } from 'react';

interface PanelGroupsProps {}

export const PanelGroups: FunctionComponent<PanelGroupsProps> = () => {
  return (
    <div className='flex flex-none flex-col overflow-y-auto overflow-x-hidden bg-gray-500 h-full'>
      panel groups
    </div>
  );
}
