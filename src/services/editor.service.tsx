import { AbstractService } from './abstract.service';

import { DiagnosticSeverity } from '@asyncapi/parser/cjs';
import { KeyMod, KeyCode, Range, MarkerSeverity, languages } from 'monaco-editor/esm/vs/editor/editor.api';

import toast from 'react-hot-toast';
import fileDownload from 'js-file-download';

import { debounce, isDeepEqual } from '../helpers';
import { appState, filesState, settingsState } from '../state';

import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';
import type { Diagnostic } from '@asyncapi/parser/cjs';
import type { ConvertVersion } from '@asyncapi/converter';
import type { File } from '../state/files.state';
import type { Document } from '../state/documents.state';
import type { SettingsState } from '../state/settings.state';

export interface UpdateState {
  content: string;
  updateModel?: boolean;
  sendToServer?: boolean;
  file?: Partial<File>;
} 

export class EditorService extends AbstractService {
  private isCreated: boolean = false;
  private instance: monacoAPI.editor.IStandaloneCodeEditor | undefined;
  private models: Map<string, monacoAPI.editor.ITextModel | null> = new Map();
  private files: Map<monacoAPI.editor.ITextModel, string> = new Map();
  private onDidChangeDisposables: Map<monacoAPI.editor.ITextModel, monacoAPI.IDisposable> = new Map();
  private viewStates: Map<string, monacoAPI.editor.ICodeEditorViewState | null> = new Map();
  
  private decorations: Map<string, string[]> = new Map();

  override onInit() {
    this.subscribeToFiles();
    this.subscribeToPanels();
    this.subcribeToDocuments();
    this.registerCompletionItemProvider();
  }

  get editor(): monacoAPI.editor.IStandaloneCodeEditor {
    return this.instance as monacoAPI.editor.IStandaloneCodeEditor;
  }

  get value(): string {
    return this.editor?.getModel()?.getValue() as string;
  }

  async onSetupEditor(elementRef: HTMLElement) {
    if (this.isCreated) {
      return;
    }
    this.isCreated = true;
  
    this.createEditor(elementRef);
    this.configureEditor();

    const panel = this.svcs.panelsSvc.getPanel('primary');
    if (panel) {
      // create models for all tabs from restored state
      panel.tabs.forEach(tab => {
        if (tab.type === 'editor') {
          this.createModel(tab.fileId);
        }
      });

      // set model for restored active tab
      const activeTab = this.svcs.panelsSvc.getTab('primary', panel.activeTab);
      if (activeTab && activeTab.type === 'editor') {
        this.setModel(activeTab.fileId);
      }
    }

    appState.setState({ initialized: true });
  }

  updateState({
    content,
    updateModel = false,
    sendToServer = true,
    file = {},
  }: UpdateState) {
    const currentContent = filesState.getState().files['asyncapi']?.content;
    if (currentContent === content || typeof content !== 'string') {
      return;
    }

    const language = file.language || this.svcs.formatSvc.retrieveLangauge(content);
    if (!language) {
      return;
    }

    if (sendToServer) {
      this.svcs.socketClientSvc.send('file:update', { code: content });
    }

    if (updateModel && this.editor) {
      const model = this.editor.getModel();
      if (model) {
        model.setValue(content);
      }
    }

    // this.svcs.filesSvc.updateFile('asyncapi', {
    //   language,
    //   content,
    //   // modified: this.getFromLocalStorage() !== content,
    //   ...file,
    // });
  }

  async saveAllModels(): Promise<void> {
    const { filesSvc } = this.svcs;
    for (const file of Object.values(filesSvc.getFiles())) {
      const model = this.models.get(file.id);
      if (model) {
        await filesSvc.saveFileContent(file.id, model.getValue());
      }
    }
  }

  async saveAllOpenedModels(): Promise<void> {
    const { filesSvc, panelsSvc } = this.svcs;

    const tabs = panelsSvc.getPanel('primary')?.tabs;
    if (!tabs) {
      return;
    }

    for (const tab of tabs) {
      const model = this.models.get(tab.fileId);
      if (model) {
        await filesSvc.saveFileContent(tab.fileId, model.getValue());
      }
    }
  }

  async convertSpec(version?: ConvertVersion | string) {
    const converted = await this.svcs.converterSvc.convert(this.value, version as ConvertVersion);
    this.updateState({ content: converted, updateModel: true });
  }

  async importFromURL(url: string): Promise<void> {
    if (url) {
      return fetch(url)
        .then(res => res.text())
        .then(async text => {
          this.updateState({ 
            content: text, 
            updateModel: true, 
            file: { 
              source: url, 
              // from: 'url' 
            },
          });
        })
        .catch(err => {
          console.error(err);
          throw err;
        });
    }
  }

  async importFile(files: FileList | null) {
    if (files === null || files?.length !== 1) {
      return;
    }
    const file = files.item(0);
    if (!file) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = fileLoadedEvent => {
      const content = fileLoadedEvent.target?.result;
      this.updateState({ content: String(content), updateModel: true });
    };
    fileReader.readAsText(file, 'UTF-8');
  }

  async importBase64(content: string) {
    try {
      const decoded = this.svcs.formatSvc.decodeBase64(content);
      this.updateState({ 
        content: String(decoded), 
        updateModel: true, 
        file: { 
          // from: 'base64', 
          source: undefined, 
        },
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async convertToYaml() {
    try {
      const yamlContent = this.svcs.formatSvc.convertToYaml(this.value);
      if (yamlContent) {
        this.updateState({ 
          content: yamlContent, 
          updateModel: true, 
          file: {
            language: 'yaml',
          }
        });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async convertToJSON() {
    try {
      const jsonContent = this.svcs.formatSvc.convertToJSON(this.value);
      if (jsonContent) {
        this.updateState({ 
          content: jsonContent, 
          updateModel: true, 
          file: {
            language: 'json',
          }
        });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async saveAsYaml() {
    try {
      const yamlContent = this.svcs.formatSvc.convertToYaml(this.value);
      if (yamlContent) {
        this.downloadFile(yamlContent, `${this.fileName}.yaml`);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async saveAsJSON() {
    try {
      const jsonContent = this.svcs.formatSvc.convertToJSON(this.value);
      if (jsonContent) {
        this.downloadFile(jsonContent, `${this.fileName}.json`);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  saveToLocalStorage(editorValue?: string, notify = true) {
    editorValue = editorValue || this.value;
    localStorage.setItem('document', editorValue);

    // this.svcs.filesSvc.updateFile('asyncapi', {
    //   from: 'in-memory',
    //   source: undefined,
    // });

    if (notify) {
      if (settingsState.getState().editor.autoSaving) {
        toast.success(
          <div>
            <span className="block text-bold">
              Studio is currently saving your work automatically 💪
            </span>
          </div>,
        );
      } else {
        toast.success(
          <div>
            <span className="block text-bold">
              Document succesfully saved to the local storage!
            </span>
          </div>,
        );
      }
    }
  }

  getFromLocalStorage() {
    return localStorage.getItem('document');
  }

  private createEditor(elementRef: HTMLElement) {
    this.instance = this.svcs.monacoSvc.monaco.editor.create(elementRef, {
      automaticLayout: true,
      theme: 'asyncapi-theme',
      wordWrap: 'on',
      smoothScrolling: true,
      glyphMargin: true,
    });
  }

  private configureEditor() {
    // apply save command
    this.editor.addCommand(
      KeyMod.CtrlCmd | KeyCode.KeyS,
      () => this.saveModelContent(),
    );
  }

  private configureModel(model: monacoAPI.editor.ITextModel) {
    let unsubscribe = model.onDidChangeContent(
      this.onChangeModelContent(model, this.svcs.settingsSvc.get()).bind(this),
    );

    this.svcs.eventsSvc.on('settings.update', (settings, prevSettings) => {
      if (isDeepEqual(settings.editor, prevSettings.editor)) {
        return;
      }

      if (unsubscribe) {
        unsubscribe.dispose();
        unsubscribe = model.onDidChangeContent(
          this.onChangeModelContent(model, this.svcs.settingsSvc.get()).bind(this),
        );
      }
    });
  }

  private getModel(fileId?: string) {
    return fileId && (this.models.get(fileId) || this.createModel(fileId));
  }

  private getCurrentModel() {
    return this.editor?.getModel();
  }

  private createModel(fileId: string, file?: File) {
    if (this.models.has(fileId)) {
      return;
    }

    const monaco = this.svcs.monacoSvc.monaco;
    file = file || this.svcs.filesSvc.getFile(fileId);
    if (!file) {
      return;
    }

    const modelUri = monaco.Uri.parse(file.uri);
    const model = monaco.editor.createModel(file.content, file.language, modelUri);
    this.configureModel(model);
    this.models.set(fileId, model);
    this.files.set(model, fileId);

    return model;
  }

  private removeModel(fileId: string) {
    const model = this.models.get(fileId);
    if (!model) {
      return;
    }

    model.dispose();
    this.models.delete(fileId);
  }

  private onChangeModelContent(model: monacoAPI.editor.ITextModel, settings: SettingsState) {
    const editorState = settings.editor;
    // TODO: save content between changing tabs
    return debounce(async (e: monacoAPI.editor.IModelContentChangedEvent) => {
      const file = this.getFile(model);
      if (!file) {
        return;
      }

      const content = model.getValue();
      return this.svcs.filesSvc.updateFile({ id: file.id, content }, { saveContent: editorState.autoSaving });
    }, editorState.savingDelay);
  }

  private saveModelContent(model?: monacoAPI.editor.ITextModel) {
    const currentModel = model || this.getCurrentModel();
    if (currentModel) {
      const file = this.getFile(currentModel);
      if (file) {
        const content = currentModel.getValue();
        this.svcs.filesSvc.saveFileContent(file.id, content);
      }
    }
  }

  private setModel(fileId: string, prevFileId?: string) {
    if (prevFileId) {
      const currentModel = this.getModel(prevFileId)
      if (currentModel) {
        const viewState = this.editor.saveViewState();
        this.viewStates.set(prevFileId, viewState);
      }
    }

    const model = this.getModel(fileId);
    if (model) {
      this.editor.setModel(model)
      this.editor.focus();

      const restoredViewState = this.viewStates.get(fileId);
      if (restoredViewState) {
        this.editor.restoreViewState(restoredViewState);
      }

      const document = this.svcs.documentsSvc.getDocument(fileId);
      if (document) {
        this.applyMarkersAndDecorations(document);
      }
    }
  }

  private changeModel(fileId: string, prevFileId?: string) {
    if (prevFileId) {
      const currentModel = this.getModel(prevFileId)
      if (currentModel) {
        const viewState = this.editor.saveViewState();
        this.viewStates.set(prevFileId, viewState);
      }
    }

    const model = this.getModel(fileId);
    if (model) {
      this.editor.setModel(model)
      this.editor.focus();

      const restoredViewState = this.viewStates.get(fileId);
      if (restoredViewState) {
        this.editor.restoreViewState(restoredViewState);
      }
    }
  }


  private getFile(model: monacoAPI.editor.ITextModel) {
    const fileId = this.files.get(model);
    if (fileId) {
      return this.svcs.filesSvc.getFile(fileId);
    } 
  }

  private applyMarkersAndDecorations(document: Document) {
    const { filedId, diagnostics } = document;
    const model = this.getModel(filedId);
    if (!model || !this.editor) {
      return;
    }

    const { markers, decorations } = this.createMarkersAndDecorations(diagnostics.filtered);
    this.svcs.monacoSvc.monaco.editor.setModelMarkers(model, filedId, markers);
    let oldDecorations = this.decorations.get(filedId) || [];
    oldDecorations = this.editor.deltaDecorations(oldDecorations, decorations);
    this.decorations.set(filedId, oldDecorations);
  }

  private removeMarkersAndDecorations(document: Document) {
    const { filedId } = document;
    const model = this.getModel(filedId);
    if (!model || !this.editor) {
      return;
    }

    this.svcs.monacoSvc.monaco.editor.setModelMarkers(model, filedId, []);
    let oldDecorations = this.decorations.get(filedId) || [];
    oldDecorations = this.editor.deltaDecorations(oldDecorations, []);
    this.decorations.set(filedId, oldDecorations);
  }

  createMarkersAndDecorations(diagnostics: Diagnostic[] = []) {
    const newDecorations: monacoAPI.editor.IModelDecoration[] = [];
    const newMarkers: monacoAPI.editor.IMarkerData[] = [];

    diagnostics.forEach((diagnostic, idx) => {
      const { message, range, severity } = diagnostic;

      if (severity !== DiagnosticSeverity.Error) {
        const className = this.getSeverityClassName(severity);
        newDecorations.push({
          id: `${className}-${idx}`,
          ownerId: 0,
          range: new Range(
            range.start.line + 1, 
            range.start.character + 1,
            range.end.line + 1,
            range.end.character + 1
          ),
          options: {
            glyphMarginClassName: this.getSeverityClassName(severity),
            glyphMarginHoverMessage: { value: message },
          },
        });
        return;
      }
  
      newMarkers.push({
        startLineNumber: range.start.line + 1,
        startColumn: range.start.character + 1,
        endLineNumber: range.end.line + 1,
        endColumn: range.end.character + 1,
        severity: this.getSeverity(severity),
        message,
      });
    });

    return { decorations: newDecorations, markers: newMarkers };
  }

  private getSeverity(severity: DiagnosticSeverity): monacoAPI.MarkerSeverity {
    switch (severity) {
    case DiagnosticSeverity.Error: return MarkerSeverity.Error;
    case DiagnosticSeverity.Warning: return MarkerSeverity.Warning;
    case DiagnosticSeverity.Information: return MarkerSeverity.Info;
    case DiagnosticSeverity.Hint: return MarkerSeverity.Hint;
    default: return MarkerSeverity.Error;
    }
  }

  private getSeverityClassName(severity: DiagnosticSeverity): string {
    switch (severity) {
    case DiagnosticSeverity.Warning: return 'diagnostic-warning';
    case DiagnosticSeverity.Information: return 'diagnostic-information';
    case DiagnosticSeverity.Hint: return 'diagnostic-hint';
    default: return 'diagnostic-warning';
    }
  }

  private fileName = 'asyncapi';
  private downloadFile(content: string, fileName: string) {
    return fileDownload(content, fileName);
  }

  private registerCompletionItemProvider() {
    const monaco = this.svcs.monacoSvc.monaco;
    if (!monaco) {
      return;
    }

    const provideCompletionItems = this.provideCompletionItems.bind(this);
    monaco.languages.registerCompletionItemProvider('json', { provideCompletionItems });
    monaco.languages.registerCompletionItemProvider('yaml', { provideCompletionItems });
  }

  private async provideCompletionItems(model: monacoAPI.editor.ITextModel, position: monacoAPI.Position): Promise<monacoAPI.languages.CompletionList> {
    const fileId = this.files.get(model);
    if (!fileId) {
      return {
        suggestions: [],
      }
    }

    const possibleResult = await this.svcs.documentsSvc.getReferenceKind(model, position);
    if (!possibleResult) {
      return {
        suggestions: [],
      }
    }

    const { kind, isInComponent } = possibleResult;
    const possibleRefs = this.svcs.documentsSvc.getPossibleReferences(fileId, kind, !isInComponent);
		const word = model.getWordUntilPosition(position);
		const range = {
			startLineNumber: position.lineNumber,
			endLineNumber: position.lineNumber,
			startColumn: word.startColumn,
			endColumn: word.endColumn
		};

    return {
      suggestions: possibleRefs.map(ref => ({
        label: `'${ref.path}'`,
        kind: languages.CompletionItemKind.Reference,
        documentation: ref.description,
        insertText: `'${ref.path}'`,
        range,
      })),
    }
  }

  private subscribeToFiles() {
    this.svcs.eventsSvc.on('fs.file.remove', file => {
      this.removeModel(file.id);
    });
  }

  private subscribeToPanels() {
    this.svcs.eventsSvc.on('panels.panel.set-active-tab', (panelId, activeTab, prevActiveTab) => {
      const panel = this.svcs.panelsSvc.getPanel(panelId);
      if (panel) {
        const currentTab = this.svcs.panelsSvc.getTab(panel.id, activeTab);
        if (currentTab && currentTab.type === 'editor') {
          const oldTab = prevActiveTab && this.svcs.panelsSvc.getTab(panel.id, prevActiveTab);
          if (oldTab && oldTab.type === 'editor') {
            this.setModel(currentTab.fileId, oldTab.fileId);
          }
          this.setModel(currentTab.fileId);
        }
      }
    });
  }

  private subcribeToDocuments() {
    this.svcs.eventsSvc.on('documents.document.create', document => {
      this.applyMarkersAndDecorations(document);
    });

    this.svcs.eventsSvc.on('documents.document.update', document => {
      this.applyMarkersAndDecorations(document);
    });

    this.svcs.eventsSvc.on('documents.document.remove', document => {
      this.removeMarkersAndDecorations(document);
    });
  }
}
