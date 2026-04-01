import type { PathLike, Stats } from "node:fs";
import { readFile, stat, writeFile } from "node:fs/promises";

import { dirname } from "path";

import { resolvePathLike } from "../resolve-path-like/resolve-path-like.js";
import { ZStreamFolder } from "./stream-folder.mjs";
import type { IZStreamRead, IZStreamReadOptions } from "./stream-read.mjs";
import type { IZStreamWrite, IZStreamWriteOptions } from "./stream-write.mjs";

/**
 * Options for the stream file object.
 */
export interface IZStreamFileOptions {
  /**
   * Cache options.
   *
   * A warning that file content caching will take up significant memory
   * if the file size is too big or the max files is too big.  Make sure
   * you know what you're doing when you change the default values of this.
   */
  cache?: {
    /**
     * Maximum number of bytes a file can be before it will not be cached.
     * The default is 100 Kib (102400 bytes)
     *
     * @default 102400
     */
    fileSize?: bigint;
    /**
     * The maximum number of files that are to be cached.  The cache order
     * is first in, first out.  Set this to 0 to not cache anything. The
     * default is 1000.
     *
     * @default 1000
     */
    maxFiles?: number;
  };
}

/**
 * A stream that can read and write to files.
 *
 * This is mostly a wrapper to readFile and writeFile from node, but
 * with some optimizations.
 *
 * First, this class supports file content caching so reading in a file
 * that's under a certain size threshold will store it in memory for
 * later retrieval.
 */
export class ZStreamFile implements IZStreamWrite, IZStreamRead {
  private static readonly FileSizeDefault = 102400; // One Hundred KibiBytes
  private static readonly MaxFilesDefault = 1000;

  private _cache = new Map<string, { stats: Stats; buffer: Promise<Buffer> }>();

  /**
   * Initializes a new instance of this object.
   *
   * @param options -
   *        The options for file read and writes.
   */
  public constructor(public readonly options: IZStreamFileOptions = {}) {}

  public async read(
    path: PathLike,
    options?: IZStreamReadOptions,
  ): Promise<Buffer> {
    const _path = resolvePathLike(path);

    const stats = await stat(_path);
    const cached = this._cache.get(_path);

    const buffer =
      cached && cached.stats.mtimeMs >= stats.mtimeMs
        ? cached.buffer
        : readFile(_path, options);

    return this._addToCache(_path, { stats, buffer });
  }

  public async write(
    path: PathLike,
    { buffer = Buffer.from("") }: IZStreamWriteOptions = {},
  ): Promise<number> {
    const _path = resolvePathLike(path);
    const directory = dirname(_path);

    await new ZStreamFolder().write(directory);
    await writeFile(_path, buffer, { flush: true });

    // If this file specifically was cached earlier,
    // we can just remove it now so we make room for
    // another file.  Consumers can just read the
    // file again to recache it.
    this._cache.delete(_path);

    return buffer.length;
  }

  private _addToCache(
    path: string,
    item: { stats: Stats; buffer: Promise<Buffer> },
  ) {
    const { cache = {} } = this.options;
    const {
      fileSize = ZStreamFile.FileSizeDefault,
      maxFiles = ZStreamFile.MaxFilesDefault,
    } = cache;

    if (item.stats.size > fileSize) {
      // In this case, the file size is too big to cache in memory,
      // so we're bowing out here.
      return item.buffer;
    }

    // We will remove this path from the cache first since
    // we want it to be the most recent file (at the end)
    // of the key list.  The removal does nothing if the
    // file was not cached.
    this._cache.delete(path);
    this._cache.set(path, item);

    if (this._cache.size > maxFiles) {
      // Retrieving the keys from a javascript map is order
      // by the time in which the keys are created.  So
      // we are going to remove the first key which is the
      // oldest.
      const itr = this._cache.keys();
      this._cache.delete(itr.next().value);
    }

    return item.buffer;
  }
}
