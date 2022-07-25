import type { FunctionComponent } from 'react';
import type { BottomPanel as BottomPanelNamespace } from '../../interfaces';

interface BottomPanelTabProps extends BottomPanelNamespace.Element {
  activeTab: string;
}

export const BottomPanelTab: FunctionComponent<BottomPanelTabProps> = ({ activeTab, ...element }) => {
  const activeClassName = activeTab === element.id
    ? 'border-gray-300 text-gray-300'
    : 'border-gray-800 text-gray-500';

  return (
    <div className={`group flex flex-row items-center justify-center bg-gray-800 h-full focus:outline-none border-b border-box cursor-pointer text-xs uppercase pb-1 ${activeClassName}`}>
      <element.tabComponent />
    </div>
  );
}
