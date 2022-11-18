import React from 'react';

import { Button } from '../../common/Button';

import { BrowserAPIFileSystemExplorer } from './BrowserAPIFileSystemExplorer';
import { DocumentStructure } from './DocumentStructure';

interface PrimarySidebarProps {}

export const PrimarySidebar: React.FunctionComponent<PrimarySidebarProps> = () => {
  return (
    <ul className='flex flex-none flex-col overflow-y-auto overflow-x-hidden bg-gray-800 h-full'>
      <li>
        <BrowserAPIFileSystemExplorer />
      </li>
      <li>
        <DocumentStructure />
      </li>
    </ul>
  )
};