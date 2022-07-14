import { Injectable, SingletonScope } from "@adi/core";

export type CommandFn = () => any | Promise<any>;

@Injectable({
  scope: SingletonScope,
})
export class CommandsService {
  private commands: Map<string, (payload: any) => any | Promise<any>> = new Map();

  registerCommand(name: string, handler: (payload: any) => any | Promise<any>): void {
    this.commands.set(name, handler);
  }

  execute<P>(name: string, payload: P): any | Promise<any> {
    const command = this.commands.get(name);
    if (typeof command === 'function') {
      return command(payload);
    }
    throw Error('Given command does not exist');
  }
}
