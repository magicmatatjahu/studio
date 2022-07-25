import { useInject } from '@adi/react';
import { useCallback, useState } from 'react';

import { TreeView } from '../../core/components/common/TreeView/TreeView';
import { Button } from '../../ui/components/Button/Button';

import { BrowserFileSystemExplorer } from '../services/browser-filesystem-explorer.service';
import { BrowserFileSystemServive } from '../../filesystem/services/browser-filesystem.service';

import { useListener } from '@/hooks';

import type { FunctionComponent } from 'react';
import type { TreeViewItem } from '../../core/components/common/TreeView/interfaces';

interface BrowserFileSystemProps {}

export const BrowserFileSystem: FunctionComponent<BrowserFileSystemProps> = () => {
  const [items, setItems] = useState<Array<TreeViewItem>>([]);
  const browserFileSystemServive = useInject(BrowserFileSystemServive);
  const browserFileSystemExplorer = useInject(BrowserFileSystemExplorer);
  const details = browserFileSystemExplorer.createTreeDetails();

  useListener('studio:bfs:**', async () => {
    const files = await browserFileSystemExplorer.createTree();
    setItems(files);
  });

  const openFolder = useCallback(async () => {
    await browserFileSystemServive.openDirectory();
    const files = await browserFileSystemExplorer.createTree();
    setItems(files);
  }, []);

  if (items.length === 0) {
    return (
      <div className='px-6 pt-3 pb-6'>
        <Button className='text-xs' onClick={openFolder}>
          Open folder
        </Button>
      </div>
    )
  }

  return (
    <div className='pb-3'>
      <TreeView id='studio:explorer:memory-file-system' items={items} details={details} />
    </div>
  );
};
