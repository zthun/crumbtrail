import type { PathLike } from "node:fs";

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
   * @param buffer -
   *        The buffer data to write to the path.  If you only have
   *        a string, then use Buffer.from(str) to convert it.  If this
   *        is falsy, then this should act like a touch.
   *
   * @returns
   *        The total number of bytes written, or 0 if buffer is falsy.
   * @throws
   *        If the path cannot be written to.
   */
  write(path: PathLike, buffer?: Buffer): Promise<number>;
}
