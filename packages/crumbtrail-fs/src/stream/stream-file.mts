import type { PathLike, Stats } from "node:fs";
import { readFile, stat, writeFile } from "node:fs/promises";
import { dirname } from "path";
import { resolvePathLike } from "../resolve-path-like/resolve-path-like.js";
import { ZStreamFolder } from "./stream-folder.mjs";
import type { IZStreamRead, IZStreamReadOptions } from "./stream-read.mjs";
import type { IZStreamWrite, IZStreamWriteOptions } from "./stream-write.mjs";

/**
 * A stream that can read and write to files.
 */
export class ZStreamFile implements IZStreamWrite, IZStreamRead {
  private _cache = new Map<string, { stats: Stats; buffer: Promise<Buffer> }>();

  public async read(
    path: PathLike,
    { nocache }: IZStreamReadOptions = {},
  ): Promise<Buffer> {
    const _path = resolvePathLike(path);

    if (nocache) {
      return readFile(_path);
    }

    const cached = this._cache.get(_path);
    const stats = await stat(_path);

    if (cached && stats.mtimeMs <= cached.stats.mtimeMs) {
      return cached.buffer;
    }

    const buffer = readFile(_path);
    this._cache.set(_path, { stats, buffer });
    return buffer;
  }

  public async write(
    path: PathLike,
    { buffer = Buffer.from("") }: IZStreamWriteOptions = {},
  ): Promise<number> {
    const _path = resolvePathLike(path);
    const directory = dirname(_path);

    await new ZStreamFolder().write(directory);
    await writeFile(_path, buffer, { flush: true });
    this._cache.delete(_path);

    return buffer.length;
  }
}
