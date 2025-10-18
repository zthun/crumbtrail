import type { OpenMode, PathLike } from "node:fs";

/**
 * Options for reading from a stream.
 */
export interface IZStreamReadOptions {
  /**
   * Allows you to cancel the read if it's taking too long.
   */
  signal?: AbortSignal;

  /**
   * The way that node will open the file.
   *
   * Default is 'r'
   */
  flag?: OpenMode;
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
