# @zthun/crumbtrail-fs

File system utilities for Node.js, with interfaces that make dependencies easier
to mock in unit tests.

The package includes:

- `ZFileSystemService` for glob searches, file system metadata, and searches up
  a directory tree.
- `ZFileWatch` for observing additions, updates, and removals through RxJS
  observables.
- `ZFileRepository` for maintaining a queryable collection of files as a
  directory changes. It excludes folders and supports glob filters.
- `ZStreamFile` for reading and writing buffers, with configurable read caching
  and automatic creation of parent directories when writing.
- `ZStreamFolder` for creating directories recursively.
- `ZFileSystemNodeBuilder` for constructing file and folder metadata, including
  test fixtures.

## Installation

Requires Node.js 22.16.0 or later. Choose npm or Yarn:

```sh
npm install @zthun/crumbtrail-fs
```

```sh
yarn add @zthun/crumbtrail-fs
```

## Usage

Search for files and folders using glob patterns, or locate a path by searching
the current directory and its ancestors:

```ts
import { ZFileSystemService } from "@zthun/crumbtrail-fs";

const fileSystem = new ZFileSystemService();
const sources = await fileSystem.search("**/*.ts", { cwd: "./src" });
const packagePath = await fileSystem.walk("package.json");
```

`search()` returns file system nodes with absolute paths. `walk()` returns the
first matching absolute path, or `null` if no match exists.

Read and write file contents as buffers:

```ts
import { ZStreamFile } from "@zthun/crumbtrail-fs";

const files = new ZStreamFile();
await files.write("./output/message.txt", { buffer: Buffer.from("Hello!\n") });
const contents = await files.read("./output/message.txt");
console.log(contents.toString("utf8"));
```

To watch changes, create a `ZFileWatch`, subscribe to its `add()`, `update()`,
or `remove()` observables, and await `start()`. Existing files do not generate
initial events. Call `stop()` and unsubscribe when you are finished. For a
`ZFileRepository`, call `initialize(path, globs)` to scan and watch files, then
call `reset()` when you are finished.
