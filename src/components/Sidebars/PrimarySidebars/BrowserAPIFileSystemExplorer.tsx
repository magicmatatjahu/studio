import React, { useState } from 'react';
import { VscNewFile, VscNewFolder, VscRefresh, VscCollapseAll } from 'react-icons/vsc';

import { Button } from '../../common/Button';
import { IconButton } from '../../common/IconButton';
import { ExpandedPanel } from '../../common/Panels/ExpandedPanel';
import { TreeView } from './TreeView/TreeView';

import { BrowserAPIFileSystemService } from '../../../services/file-system';
import state from '../../../state';

interface BrowserAPIFileSystemExplorerProps {}

export const BrowserAPIFileSystemExplorer: React.FunctionComponent<BrowserAPIFileSystemExplorerProps> = () => {
  const [opened, setOpened] = useState(false);
  const browserAPIFiles = state.useFileSystemState().browserAPIFiles.get();

  if (!BrowserAPIFileSystemService.isSupported()) {
    return (
      null
    );
  }

  const actions = [
    <IconButton 
      onClick={(e) => {
        e.stopPropagation();
        BrowserAPIFileSystemService.createFile('lol3.json', '')
      }}
      icon={VscNewFile}
    />,
    <IconButton 
      onClick={(e) => {
        e.stopPropagation();
        BrowserAPIFileSystemService.createDirectory('dupa')
      }}
      icon={VscNewFolder}
    />,
    <IconButton 
      onClick={(e) => {
        e.stopPropagation();
        BrowserAPIFileSystemService.refresh()
      }}
      icon={VscRefresh}
    />,
  ];

  return (
    <ExpandedPanel title='File system' actions={opened ? actions : []}>
      {opened ? (
        <div className='pb-3'>
          <TreeView files={browserAPIFiles} />
        </div>
      ) : (
        <div className='px-6 py-3'>
          <Button className='text-xs' onClick={async () => {
            await BrowserAPIFileSystemService.openDirectory();
            setOpened(true);
          }}>
            Open folder
          </Button>
        </div>
      )}
    </ExpandedPanel>
  )
};
