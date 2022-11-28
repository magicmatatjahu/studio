import { useState, useEffect } from 'react';

import { FlowDiagram } from './FlowDiagram';

import { useDocumentsState, useSettingsState } from '../../state/new';
import state from '../../state';

import type { OldAsyncAPIDocument as AsyncAPIDocument } from '@asyncapi/parser/cjs';
import type { FunctionComponent } from 'react';

interface VisualiserProps {}

export const Visualiser: FunctionComponent<VisualiserProps> = () => {
  const [parsedSpec, setParsedSpec] = useState<AsyncAPIDocument | null>(null);
  const document = useDocumentsState(state => state.documents['asyncapi']?.document);
  const autoRendering = useSettingsState(state => state.templates.autoRendering);

  const editorState = state.useEditorState();
  const templateState = state.useTemplateState();
  const editorLoaded = editorState.editorLoaded.get();

  useEffect(() => {
    if (autoRendering || parsedSpec === null) {
      setParsedSpec(document || null);
    }
  }, [document]); // eslint-disable-line

  useEffect(() => {
    if (templateState.rerender.get()) {
      setParsedSpec(document || null);
      templateState.rerender.set(false);
    }
  }, [templateState.rerender.get()]); // eslint-disable-line

  if (editorLoaded === false) {
    return (
      <div className="flex flex-1 overflow-hidden h-full justify-center items-center text-2xl mx-auto px-6 text-center">
        <div>
          <div className="w-full text-center h-8">
            <div className="rotating-wheel"></div>
          </div>
          <p className="mt-1 text-sm">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-1 overflow-hidden h-full justify-center items-center text-2xl mx-auto px-6 text-center">
        <p>Empty or invalid document. Please fix errors/define AsyncAPI document.</p>
      </div>
    );
  }

  return (
    document && (
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        <div className="overflow-auto">
          <FlowDiagram document={document} />
        </div>
      </div>
    )
  );
};
