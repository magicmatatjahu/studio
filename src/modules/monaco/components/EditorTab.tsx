import type { FunctionComponent } from 'react';
import type { PanelTab } from '../../core/services/interfaces';

interface EditorTabProps extends PanelTab {}

export const EditorTab: FunctionComponent<EditorTabProps> = ({ data }) => {
  return (
    <div>{data?.item?.label}</div>
  );
};
