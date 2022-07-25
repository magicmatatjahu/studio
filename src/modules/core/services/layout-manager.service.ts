import { Inject, Injectable, SingletonScope } from "@adi/core";

import { EventEmitterService } from "@/modules/events/services/event-emitter.service";

import type { OnInit } from "@adi/core";
import type { 
  ActivityBar as ActivityBarNamespace,
  BottomPanel as BottomPanelNamespace,
} from '../interfaces';

@Injectable({
  scope: SingletonScope,
})
export class LayoutManager implements OnInit {
  private readonly activityBarElements: Map<string, ActivityBarNamespace.Element> = new Map();
  private readonly bottomPanelElements: Map<string, BottomPanelNamespace.Element> = new Map();

  constructor(
    private readonly events: EventEmitterService,
    @Inject('studio:activity-bar:element') abElements: ActivityBarNamespace.Element[],
    @Inject('studio:bottom-bar:element') bpElements: BottomPanelNamespace.Element[],
  ) {
    abElements.forEach(element => {
      this.activityBarElements.set(element.id, element);
    });
    bpElements.forEach(element => {
      this.bottomPanelElements.set(element.id, element);
    });
  }

  onInit(): void | Promise<void> {

  }

  showActivityBar(show: boolean) {
    this.events.emitAsync('studio:activity-bar:show', { show });
  }

  setActiveActivityBar(id: string) {
    this.events.emitAsync('studio:activity-bar:set-active', { id });
  }

  showBottomPanel(show: boolean) {
    this.events.emitAsync('studio:bottom-panel:show', { show });
  }

  showActiveBottomPanel(id: string) {
    this.events.emitAsync('studio:bottom-panel:set-active', { id });
  }

  showPrimarySidebar(show: boolean) {
    this.events.emitAsync('studio:primary-sidebar:show', { show });
  }

  showSecondarySidebar(show: boolean) {
    this.events.emitAsync('studio:secondary-sidebar:show', { show });
  }

  setActiveSecondarySidebar(show: boolean) {
    this.events.emitAsync('studio:secondary-sidebar:set-active', { show });
  }
}
