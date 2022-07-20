import { useInject } from '@adi/react';

import { OpenTools } from './OpenTools';
import { BrowserFileSystem } from './BrowserFileSystem';
import { MemoryFileSystem } from './MemoryFileSystem';
import { DocumentStructure } from './DocumentStructure';
import { ExpandedGroup } from '../../core/components/common/ExpandedPanel/ExpandedGroup';

import { BrowserFileSystemExplorer } from '../services/browser-filesystem-explorer.service';

import type { FunctionComponent } from 'react';
import type { ExpandedPanel } from '../../core/components/common/ExpandedPanel/interfaces';

interface PrimarySideBarViewProps {}

export const PrimarySideBarView: FunctionComponent<PrimarySideBarViewProps> = () => {
  const browserFileSystemExplorer = useInject(BrowserFileSystemExplorer);

  const panels: Array<ExpandedPanel> = [
    {
      id: 'explorer:open-editors',
      title: 'Open Tools',
      opened: false,
      component: OpenTools,
    },
    {
      id: 'explorer:browser-file-system',
      title: 'File System',
      opened: true,
      component: BrowserFileSystem,
      actions: browserFileSystemExplorer.createPanelActions(),
    },
    {
      id: 'explorer:memory-file-system',
      title: 'Memory File System',
      opened: false,
      component: MemoryFileSystem,
    },
    {
      id: 'explorer:asyncapi-document-structure',
      title: 'Document Structure',
      opened: false,
      component: DocumentStructure,
    }
  ]

  return (
    <ExpandedGroup 
      title="Explorer" 
      panels={panels}
    />
  );
};
