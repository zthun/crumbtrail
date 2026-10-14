# @zthun/crumbtrail-nest

NestJS integration for `@zthun/crumbtrail-fs`. The package provides
`ZFileSystemModule` and the `ZFileSystemToken` injection token so NestJS
services can use a file system interface that is easy to replace in tests.

## Installation

Requires NestJS 11 or 12 (`@nestjs/common >=11 <13`). The underlying
`@zthun/crumbtrail-fs` package requires Node.js 22.16.0 or later.

Choose npm or Yarn:

```sh
npm install @zthun/crumbtrail-nest
```

```sh
yarn add @zthun/crumbtrail-nest
```

## Usage

Import `ZFileSystemModule` into the module that provides your service, then
inject `ZFileSystemToken`:

```ts
import { Inject, Injectable, Module } from "@nestjs/common";
import type { IZFileSystemService } from "@zthun/crumbtrail-fs";
import { ZFileSystemModule, ZFileSystemToken } from "@zthun/crumbtrail-nest";

@Injectable()
export class FilesService {
  constructor(
    @Inject(ZFileSystemToken)
    private readonly fileSystem: IZFileSystemService,
  ) {}

  findTypeScriptFiles() {
    return this.fileSystem.search("**/*.ts", { cwd: "./src" });
  }
}

@Module({
  imports: [ZFileSystemModule],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
```
