import { ExpandedPanel } from './ExpandedPanel';

import type React from 'react';

interface ExpandedGroupProps extends React.PropsWithChildren {
  title: string;
  panels: Array<{
    id: string;
    title: string;
    opened: boolean;
    component: React.ElementType;
  }>;
}

export const ExpandedGroup: React.FunctionComponent<ExpandedGroupProps> = ({
  title,
  panels,
}) => {
  return (
    <div className="flex flex-col">
      <h2 className="p-2 text-gray-500 text-xs uppercase">
        {title}
      </h2>

      <div className='w-full'>
        {panels.map(panel => (
          <div key={panel.id}>
            <ExpandedPanel title={panel.title} opened={panel.opened}>
              <panel.component />
            </ExpandedPanel>
          </div>
        ))}
      </div>
    </div>
  );
};
