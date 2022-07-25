import { useInject } from "@adi/react";
import { createContext } from "react";

import { CommandsService } from "@/modules/commands/commands.service";
import { EventEmitterService } from "@/modules/events/services/event-emitter.service";

export interface StudioContextProps {
  commands: CommandsService;
  events: EventEmitterService;
}

export const StudioContext = createContext<StudioContextProps>({} as any);

export function prepareStudioContextValue(): StudioContextProps {
  const commands = useInject(CommandsService);
  const events = useInject(EventEmitterService);

  return {
    commands,
    events,
  }
}