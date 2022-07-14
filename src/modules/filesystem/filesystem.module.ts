import { Module } from "@adi/core";

import { FileSystemService } from "./services/filesystem.service";
import { MemoryFileSystemServive } from "./services/memory-filesyste.service";

@Module({
  providers: [
    {
      provide: FileSystemService,
      useClass: MemoryFileSystemServive
    },
  ],
  exports: [
    FileSystemService,
  ]
})
export class FileSystemModule {}
