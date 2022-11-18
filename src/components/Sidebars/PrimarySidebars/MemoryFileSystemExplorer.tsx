import React from 'react';

import { Button } from '../../common/Button';

interface MemoryFileSystemExplorerProps {}

export const MemoryFileSystemExplorer: React.FunctionComponent<MemoryFileSystemExplorerProps> = () => {
  return (
    <div className='px-6 pt-3 pb-6'>
      <Button className='text-xs'>
        Open folder
      </Button>
    </div>
  )
};