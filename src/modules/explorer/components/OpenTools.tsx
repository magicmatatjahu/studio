import { TreeView } from '../../core/components/common/TreeView/TreeView';

import type React from 'react';

interface OpenToolsProps {}

export const OpenTools: React.FunctionComponent<OpenToolsProps> = () => {
  return (
    <TreeView id='studio:explorer:open-tools' />
  );
};
