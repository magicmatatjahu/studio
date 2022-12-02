import create from 'zustand';

import type { OldAsyncAPIDocument as AsyncAPIDocument, Diagnostic, ParseOutput } from '@asyncapi/parser/cjs';

export type DocumentDiagnostics = {
  original: Diagnostic[];
  filtered: Diagnostic[];
  errors: Diagnostic[];
  warnings: Diagnostic[];
  informations: Diagnostic[];
  hints: Diagnostic[];
}

export type Document = {
  uri: string;
  document?: AsyncAPIDocument;
  extras?: ParseOutput['extras'];
  diagnostics: DocumentDiagnostics;
  valid?: boolean;
}

export type DocumentsState = {
  documents: Record<string, Document>; 
}

export type DocumentsActions = {
  updateDocument: (uri: string, document: Partial<Document>) => void;
  removeDocument: (uri: string) => void;
}

export const documentsState = create<DocumentsState & DocumentsActions>(set => ({
  documents: {},
  updateDocument(uri: string, document: Partial<Document>) {
    set(state => ({ documents: { ...state.documents, [String(uri)]: { ...state.documents[String(uri)] || {}, ...document } } }));
  },
  removeDocument(uri: string) {
    set(state => {
      const documents = { ...state.documents };
      const document = documents[String(uri)];
      if (!document) {
        return state;
      }

      delete documents[String(uri)];
      return { documents };
    });
  }
}));

export const useDocumentsState = documentsState;