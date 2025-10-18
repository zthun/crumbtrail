import type { PathLike } from "node:fs";

/**
 * Options for reading from a stream.
 */
export interface IZStreamReadOptions {
  /**
   * Do not utilize any cache.
   *
   * This always forces a read from the disk.
   */
  nocache?: boolean;
}

/**
 * An object that can read from a stream path.
 */
export interface IZStreamRead {
  /**
   * Reads from the given path.
   *
   * @param path -
   *        The path to read from.
   * @param options -
   *        Options for the read.
   *
   * @returns
   *        The buffered data from the path.
   * @throws
   *        If the path does not exist or cannot be read.
   */
  read(path: PathLike, options?: IZStreamReadOptions): Promise<Buffer>;
}
