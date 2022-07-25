import { Module, Injector } from "@adi/core";

import { AsyncAPIModule } from './modules/asyncapi/asyncapi.module';
import { CommandsModule } from './modules/commands/commands.module';
import { CoreModule } from './modules/core/core.module';
import { ExplorerModule } from './modules/explorer/explorer.module';
import { EventsModule } from './modules/events/events.module';
import { FileSystemModule } from './modules/filesystem/filesystem.module';
import { MonacoModule } from './modules/monaco/monaco.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { StateModule } from './modules/state/state.module';
import { TerminalModule } from './modules/terminal/terminal.module';
import { ToolsManager } from './modules/tools/tools.module';

@Module({
  imports: [
    CoreModule,
    CommandsModule,
    AsyncAPIModule,
    ExplorerModule,
    EventsModule,
    FileSystemModule,
    MonacoModule,
    NavigationModule,
    StateModule,
    TerminalModule,
    TerminalModule,
    ToolsManager,
  ]
})
export class AppModule {}

export async function bootstrapAppInjector() {
  return await Injector.create(AppModule).init();
}
