import { useInject } from '@adi/react';
import { useState, useRef, useEffect } from 'react';

import { MonacoService } from '../services/monaco.service';
import { BrowserFileSystemServive } from '../../filesystem/services/browser-filesystem.service';
import { FileSystemHelpersServive } from '../../filesystem/services/filesystem-helpers.service';

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
  const fileSystemHelpers = useInject(FileSystemHelpersServive);

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
      const extension = fileSystemHelpers.extension(label);
      const content = await browserFileSystem.readFile(label);
      const modelUri = Uri.file(label);

      const model = monacoService.getOrCreateModel(
        content,
        extension,
        modelUri,
      );

      // for react strict mode
      editorRef.current && monacoService.removeEditor(editorRef.current);
      const editor = editorRef.current = monacoService.createEditor(domElementRef.current!, {
        model,
        automaticLayout: true,
      }, {});

      editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, async () => {
        const model = editor.getModel();
        if (model) {
          await browserFileSystem.overwriteFile(label, model.getValue());
        }
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
