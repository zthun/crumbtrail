import type { PathLike } from "node:fs";

/**
 * Options for the write operation.
 */
export interface IZStreamWriteOptions {
  /**
   * The data buffer to write if the write is to a file.
   *
   * This should do nothing if creating a folder.  If this is
   * falsy and a file is being written, then the write operation
   * acts like a touch and simply creates an empty file.
   */
  buffer?: Buffer;
}

/**
 * An object that can write to a stream.
 */
export interface IZStreamWrite {
  /**
   * Writes to a given path.
   *
   * @param path -
   *        The path to write to.  If this points to a hierarchy,
   *        then all hierarchy nodes should be created.
   * @param options -
   *        The options for the write.
   *
   * @returns
   *        The total number of bytes written, or 0 if buffer is falsy.
   *        If this is writing or creating directories, then 0 should
   *        be returned.
   * @throws
   *        If the path cannot be written to.
   */
  write(path: PathLike, options?: IZStreamWriteOptions): Promise<number>;
}
