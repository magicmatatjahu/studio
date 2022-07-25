import { Injectable, SingletonScope } from "@adi/core";

import { EventEmitterService } from "../../events/services/event-emitter.service";

import type * as monacoAPI from 'monaco-editor/esm/vs/editor/editor.api';

export enum ProblemSeverity {
  Hint = 'hint',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
}

export interface Range {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface ProblemsInstance {
	owner: string;
	resource: monacoAPI.Uri;
  problems: ProblemRecord[];
}

export interface ProblemRecord {
  severity: ProblemSeverity;
  message: string;
  range: Range;
}

@Injectable({
  scope: SingletonScope,
})
export class ProblemsManager {
  private readonly problems: Map<string, ProblemsInstance> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitterService,
  ) {}

  add(problems: ProblemsInstance) {
    this.problems.set(problems.owner, problems);
    this.eventEmitter.emit('studio:problems:add', { problems });
    this.update();
  }

  remove(owner: string) {
    const problems = this.problems.get(owner);
    if (problems) {
      this.problems.delete(owner);
      this.eventEmitter.emit('studio:problems:remove', { problems });
      this.update();
    }
  }

  private update() {
    this.eventEmitter.emit('studio:problems:update', { problems: this.problems });
  }
}
