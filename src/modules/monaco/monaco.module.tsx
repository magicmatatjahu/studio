import { Module, INITIALIZERS } from "@adi/core";
import * as monaco from 'monaco-editor';

import { MonacoEditor } from "./components/MonacoEditor";

import { MonacoService } from "./services/monaco.service";

@Module({
  providers: [
    MonacoService,
    {
      provide: INITIALIZERS,
      useClass: MonacoService,
    },
  ],
  exports: [
    MonacoService,
    {
      provide: 'studio:monaco',
      useValue: monaco,
    },
    {
      provide: 'studio:views:element',
      useValue: {
        id: 'studio:view:monaco-editor',
        tab: () => <div></div>,
        content: MonacoEditor,
      }
    }
  ]
})
export class MonacoModule {}
