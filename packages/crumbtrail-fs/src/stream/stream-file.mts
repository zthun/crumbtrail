import type { PathLike } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname } from "path";
import { resolvePathLike } from "../resolve-path-like/resolve-path-like.js";
import { ZStreamFolder } from "./stream-folder.mjs";
import type { IZStreamRead, IZStreamReadOptions } from "./stream-read.mjs";
import type { IZStreamWrite, IZStreamWriteOptions } from "./stream-write.mjs";

/**
 * A stream that can read and write to files.
 */
export class ZStreamFile implements IZStreamWrite, IZStreamRead {
  public async read(
    path: PathLike,
    options?: IZStreamReadOptions,
  ): Promise<Buffer> {
    const _path = resolvePathLike(path);

    return readFile(_path, options);
  }

  public async write(
    path: PathLike,
    { buffer = Buffer.from("") }: IZStreamWriteOptions = {},
  ): Promise<number> {
    const _path = resolvePathLike(path);
    const directory = dirname(_path);

    await new ZStreamFolder().write(directory);
    await writeFile(_path, buffer, { flush: true });

    return buffer.length;
  }
}
