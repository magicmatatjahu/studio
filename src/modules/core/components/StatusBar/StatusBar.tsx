import type { FunctionComponent } from 'react';

interface StatusBarProps {}

export const StatusBar: FunctionComponent<StatusBarProps> = () => {
  return (
    <div className="flex flex-none flex-row items-center justify-between overflow-y-auto overflow-x-hidden bg-pink-500 h-5 border-t border-gray-700 px-5">
      lol
    </div>
  );
}
