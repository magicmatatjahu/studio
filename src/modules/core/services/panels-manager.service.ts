import { Inject, Injectable, SingletonScope } from "@adi/core";

import { EventEmitterService } from "../../events/services/event-emitter.service";

import type { OnInit } from "@adi/core";
import type { Panel, PanelTab } from "./interfaces";

@Injectable({
  scope: SingletonScope,
})
export class PanelsManager implements OnInit {
  private nextUniqueId = 0;

  private activePanel: string = '';
  private panels: Map<string, Panel> = new Map();
  private panelsOrder: Array<string> = [];
  private tabs: Map<string, PanelTab> = new Map();

  constructor(
    protected readonly eventEmitter: EventEmitterService,
    @Inject('studio:views:element') protected readonly views: any[],
  ) {}

  onInit(): void | Promise<void> {
    const firstPanel = this.createPanel();
    const firstTab = this.createDefaultTab(firstPanel.id);

    this.activePanel = firstPanel.id;
    firstPanel.activeTab = firstTab.id;
  }

  getPanels(): Array<Panel> {
    return this.panelsOrder.map(panelId => this.panels.get(panelId)!);
  }

  getTabs(): Array<PanelTab> {
    return Array.from(this.tabs.values());
  }

  getActivePanel(): string {
    return this.activePanel;
  }

  getPanel(id: string): Panel | undefined {
    return this.panels.get(id);
  }

  getTab(id: string): PanelTab | undefined {
    return this.tabs.get(id);
  }

  createPanel(nextTo?: string): Panel {
    const id = this.generateUniqueId();
    const panel: Panel = {
      id,
      visible: true,
      tabs: [],
      activeTab: '',
    };
    
    this.panels.set(id, panel);
    if (nextTo) {
      const panelIndex = this.panelsOrder.findIndex(panelId => panelId === id);
      if (panelIndex === -1) {
        this.panelsOrder.push(id);
      } else {
        this.panelsOrder = this.panelsOrder.splice(panelIndex, 0, id);
      }
    } else {
      this.panelsOrder.push(id);
    }

    this.eventEmitter.emit('studio:panels:create-panel', { panel });
    return panel;
  }

  createTab(
    panelId: string,
    toolId: string,
    tab: React.ReactNode,
    content: React.ReactNode,
  ): PanelTab {
    const id = this.generateUniqueId();
    const panelTab: PanelTab = {
      id,
      panelId,
      toolId,
      tab,
      content,
    };
    this.tabs.set(id, panelTab);
    const panel = this.getPanel(panelId)!;
    panel.tabs.push(panelTab);
    panel.activeTab = id;
    this.eventEmitter.emit('studio:panels:create-tab', { tab: panelTab });
    this.eventEmitter.emit('studio:panels:update-panel', { panel });
    return panelTab;
  }

  createDefaultTab(panelId: string): PanelTab {
    return this.createTab(panelId, 'studio:view:default', null, null);
  }

  removePanel(id: string) {
    const panel = this.getPanel(id);
    if (panel === undefined) return;
    panel.tabs.forEach(tab => this.tabs.delete(tab.id));
    this.panels.delete(id);
    this.panelsOrder = this.panelsOrder.filter(panelId => panelId !== id);
    this.eventEmitter.emit('studio:panels:delete-panel', { panel });
  }

  removeTab(id: string) {
    const tab = this.getTab(id);
    if (tab === undefined) return;
    this.tabs.delete(id);
    const panel = this.getPanel(tab.panelId);
    if (panel === undefined) return;
    const tabIndex = panel.tabs.findIndex(t => t.id === id);
    panel.tabs = panel.tabs.filter(t => t.id !== id);

    if (panel.activeTab === id) {
      if (tabIndex < 1) {
        panel.activeTab = panel.tabs[0]?.id || '';
      } else {
        panel.activeTab = panel.tabs[tabIndex - 1].id;
      }
    }

    this.eventEmitter.emit('studio:panels:delete-tab', { tab });
    this.eventEmitter.emit('studio:panels:update-panel', { panel });
  }

  setActivePanel(id: string) {
    this.activePanel = id;
    this.eventEmitter.emit('studio:panels:set-active-panel', { panel: this.getPanel(id) });
  }

  setPanelVisibility(id: string, visible?: boolean) {
    const panel = this.getPanel(id);
    if (panel === undefined) return;
    panel.visible = typeof visible === 'boolean' ? visible : !panel.visible;
    this.eventEmitter.emit('studio:panels:update-panel', { panel });
  }

  setActiveTab(id: string) {
    const tab = this.getTab(id);
    if (tab === undefined) return;
    const panel = this.getPanel(tab.panelId);
    if (panel === undefined) return;
    panel.activeTab = id;
    this.eventEmitter.emit('studio:panels:set-active-tab', { tab });
    this.eventEmitter.emit('studio:panels:update-panel', { panel });
  }

  private generateUniqueId() {
    this.nextUniqueId = (this.nextUniqueId + 1) & 2147483647;
    return `ID-${this.nextUniqueId.toString(36)}`;
  }
}
