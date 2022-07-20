import { INITIALIZERS, Module } from "@adi/core";

import { FileSystemService } from "./services/filesystem.service";
import { BrowserFileSystemServive } from "./services/browser-filesystem.service";
import { MemoryFileSystemServive } from "./services/memory-filesyste.service";

import { FileSystemHelpersServive } from "./services/filesystem-helpers.service";

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
    FileSystemHelpersServive,
  ]
})
export class FileSystemModule {}
