import { INITIALIZERS, Module } from "@adi/core";

import { FileSystemService } from "./services/filesystem.service";
import { BrowserFileSystemServive } from "./services/browser-filesystem.service";
import { MemoryFileSystemServive } from "./services/memory-filesyste.service";

@Module({
  providers: [
    {
      provide: FileSystemService,
      useClass: MemoryFileSystemServive
    },
  ],
  exports: [
    BrowserFileSystemServive,
    FileSystemService,
  ]
})
export class FileSystemModule {}
