import 'reflect-metadata';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Module, Injector } from "@adi/core";
import { Module as ModuleProvider } from '@adi/react';

import { AsyncAPIModule } from './modules/asyncapi/asyncapi.module';
import { CommandsModule } from './modules/commands/commands.module';
import { CoreModule } from './modules/core/core.module';
import { ExplorerModule } from './modules/explorer/explorer.module';
import { EventsModule } from './modules/events/events.module';
import { FileSystemModule } from './modules/filesystem/filesystem.module';
import { MonacoModule } from './modules/monaco/monaco.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { StateModule } from './modules/state/state.module';
import { ToolsManager } from './modules/tools/tools.module';

import { App } from './App';

import './tailwind.css';
import "allotment/dist/style.css";
import './main.css';

// import reportWebVitals from './reportWebVitals';

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
    ToolsManager,
  ]
})
export class AppModule {}

async function bootstrap() {
  const injector = await Injector.create(AppModule).init();

  const root = createRoot(
    document.getElementById('root') as HTMLElement
  );
  
  root.render(
    <StrictMode>
      <ModuleProvider module={injector} cacheID='studio:app'>
        <App />
      </ModuleProvider>
    </StrictMode>
  );
}

bootstrap();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
