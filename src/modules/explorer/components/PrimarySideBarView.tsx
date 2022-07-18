import { OpenTools } from './OpenTools';
import { BrowserFileSystem } from './BrowserFileSystem';
import { MemoryFileSystem } from './MemoryFileSystem';
import { DocumentStructure } from './DocumentStructure';
import { ExpandedGroup } from '../../core/components/common/ExpandedPanel/ExpandedGroup';

import type React from 'react';

interface PrimarySideBarViewProps {}

export const PrimarySideBarView: React.FunctionComponent<PrimarySideBarViewProps> = () => {
  const panels = [
    {
      id: 'explorer:open-editors',
      title: 'Open Tools',
      opened: false,
      component: OpenTools,
    },
    {
      id: 'explorer:browser-file-system',
      title: 'Browser File System',
      opened: false,
      component: BrowserFileSystem,
    },
    {
      id: 'explorer:memory-file-system',
      title: 'Memory File System',
      opened: true,
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
