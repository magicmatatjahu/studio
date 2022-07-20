import { useInject } from '@adi/react';
import { useState, useRef, useEffect } from 'react';

import { MonacoService } from '../services/monaco.service';
import { BrowserFileSystemServive } from '../../filesystem/services/browser-filesystem.service';

import { Uri } from 'monaco-editor/esm/vs/editor/editor.api';

import { KeyMod, KeyCode } from 'monaco-editor/esm/vs/editor/editor.api';

import type { FunctionComponent } from 'react';
import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';

interface MonacoEditorProps {
  data: any;
}

export const MonacoEditor: FunctionComponent<MonacoEditorProps> = ({ data }) => {
  const monacoService = useInject(MonacoService);
  const browserFileSystem = useInject(BrowserFileSystemServive);

  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef<monacoAPI.editor.IStandaloneCodeEditor>();
  const domElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let listener: monacoAPI.IDisposable | undefined; 

    async function init() {
      if (!data) {
        return;
      }

      const label = data.item.label;
      const extension = browserFileSystem.extension(label);
      const unit8Array = await browserFileSystem.readFile(label);
      const content = Buffer.from(unit8Array.buffer).toString();

      const model = monacoService.getOrCreateModel(
        content,
        extension,
        Uri.file(label),
      );

      // for react strict mode
      editorRef.current && monacoService.removeEditor(editorRef.current);
      const editor = editorRef.current = monacoService.createEditor(domElementRef.current!, {
        model,
        automaticLayout: true,
      }, {});

      editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, async () => {
        const modelValue = editor.getModel()?.getValue();
        const unit8Array = new Uint8Array(modelValue!.split('').map(l => l.charCodeAt(0)));
        await browserFileSystem.overwriteFile(label, unit8Array);
      });

      setIsEditorReady(true);
    }

    init();
    return () => {
      listener?.dispose();
      editorRef.current && monacoService.removeEditor(editorRef.current);
    };
  }, []); 

  return (
    <div 
      className='h-full overflow-hidden'
      ref={domElementRef} 
    />
  );
}
