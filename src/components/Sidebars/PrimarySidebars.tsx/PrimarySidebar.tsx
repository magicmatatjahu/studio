import React from 'react';

import { Button } from '../../common/Button';

interface BrowserFileSystemProps {}

export const BrowserAPIFileSystemExplorer: React.FunctionComponent<BrowserFileSystemProps> = () => {
  return (
    <div className='px-6 pt-3 pb-6'>
      <Button className='text-xs'>
        Open folder
      </Button>
    </div>
  )
};