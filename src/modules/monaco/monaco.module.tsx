import { Module, INITIALIZERS } from "@adi/core";

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
