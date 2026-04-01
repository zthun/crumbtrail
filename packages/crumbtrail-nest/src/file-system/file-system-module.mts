import { Module } from "@nestjs/common";
import { ZFileSystemService } from "@zthun/crumbtrail-fs";

import { ZFileSystemToken } from "./file-system-service.mjs";

@Module({
  providers: [
    { provide: ZFileSystemToken, useClass: ZFileSystemService },
    ZFileSystemService,
  ],
  exports: [ZFileSystemToken, ZFileSystemService],
})
export class ZFileSystemModule {}
