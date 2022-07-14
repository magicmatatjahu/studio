import { useState, useRef } from 'react';

import type { FunctionComponent } from 'react';

interface MonacoEditorProps {
  initialValue: string;
  language: string;
}

export const MonacoEditor: FunctionComponent<MonacoEditorProps> = () => {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef(null);

  return (
    <div className='flex flex-none flex-col overflow-y-auto overflow-x-hidden bg-gray-800 h-full'>
      bottom panel
    </div>
  );
}
