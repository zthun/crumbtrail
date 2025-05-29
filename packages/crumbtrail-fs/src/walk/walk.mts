import { access } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { cwd } from "node:process";

/**
 * Options for where a directory walk starts.
 */
export interface ZWalkOptions {
  /**
   * The starting directory.
   *
   * The default is the current working directory
   *
   * @see process.cwd for more information.
   */
  start?: string;

  /**
   * The directory to stop at.
   *
   * The default is the root of the file system.
   */
  stop?: string;

  /**
   * The type of mode that the path must support in order
   * to be approved.
   *
   * The default is undefined and left up to the node api.
   */
  mode?: number;
}

/**
 * Walks up a directory tree to search for existence of a given path.
 *
 * @param search -
 *        The path to search for.  This is the candidate folder path that
 *        may or may not exist somewhere from the start directory all the
 *        way up the directory tree.
 * @param options -
 *        The given options for the search.
 *
 * @returns
 *        The fully qualified path to the first path that matches the search
 *        starting at the options start or the current working directory if not
 *        specified.  Returns null if no such directory exists.
 *
 * @example
 *
 * ```ts
 * import { resolve } from 'path'
 *
 * // Find any folder named .vscode from the current working directory all the way
 * // up the directory tree.  Returns null if no vscode directory can be found.
 * const vscode = walk('.vscode');
 *
 * // Walk the directory tree from the current script and find the .config folder.
 * const config = walk('.config', { start: __dirname });
 *
 * // Walk the directory tree from the current script and stop when we reach
 * // at most 2 directories up.
 * const start = __dirname;
 * const stop = resolve(__dirname, '../..');
 * const file = walk('path/to/file.json', { start, stop });
 * ```
 */
export async function walk(
  search: string,
  options?: ZWalkOptions,
): Promise<string | null> {
  const start = options?.start || cwd();
  const stop = options?.stop || "/";
  const mode = options?.mode;

  const _test = async (path: string) => {
    try {
      await access(path, mode);
      return true;
    } catch {
      return false;
    }
  };

  if (isAbsolute(search)) {
    return (await _test(search)) ? search : null;
  }

  let dir = start;
  do {
    const path = resolve(dir, search);
    const exists = await _test(path);

    if (exists) {
      return path;
    }

    dir = dir === stop ? "" : dirname(dir);
  } while (dir.length);

  return null;
}
