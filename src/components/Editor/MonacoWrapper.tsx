import React from 'react';
import MonacoEditor, {
  EditorProps as MonacoEditorProps,
} from '@monaco-editor/react';
import * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';

import { debounce } from '../../helpers';
import { useServices } from '../../services';
import { useSettingsState } from '../../state/new';
import state from '../../state';

export type MonacoWrapperProps = MonacoEditorProps

export const MonacoWrapper: React.FunctionComponent<MonacoWrapperProps> = ({
  ...props
}) => {
  const { editorSvc, parserSvc } = useServices();
  const editorState = state.useEditorState();
  const editorSettings = useSettingsState(state => state.editor);

  async function handleEditorDidMount(
    editor: monacoAPI.editor.IStandaloneCodeEditor,
  ) {
    // save editor instance to the window
    window.Editor = editor;
    // parse on first run the spec
    parserSvc.parse('asyncapi', editorSvc.getValue());

    // apply save command
    editor.addCommand(
      monacoAPI.KeyMod.CtrlCmd | monacoAPI.KeyCode.KeyS,
      () => editorSvc.saveToLocalStorage(),
    );

    // mark editor as loaded
    editorState.editorLoaded.set(true);
  }

  const onChange = debounce((v: string) => {
    editorSvc.updateState({ content: v });
    editorSettings.autoSaving && editorSvc.saveToLocalStorage(v, false);
    parserSvc.parse('asyncapi', v);
  }, editorSettings.savingDelay);

  return editorState.monacoLoaded.get() ? (
    <MonacoEditor
      defaultPath='asyncapi'
      language={editorState.language.get()}
      defaultValue={editorState.editorValue.get()}
      theme="asyncapi-theme"
      onMount={handleEditorDidMount}
      onChange={onChange}
      options={{
        wordWrap: 'on',
        smoothScrolling: true,
        glyphMargin: true,
      }}
      {...(props || {})}
    />
  ) : null;
};
