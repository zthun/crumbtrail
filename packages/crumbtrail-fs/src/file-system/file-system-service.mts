import { glob } from "glob";
import { access } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { cwd } from "node:process";
import type { IZFileSystemNode } from "./file-system-node.mjs";
import { ZFileSystemNodeBuilder } from "./file-system-node.mjs";

/**
 * Represents options for searches.
 */
export interface IZFileSystemSearchOptions {
  /**
   * The directory to search in.
   *
   * If this is not set, then the cwd of the application is used.
   */
  cwd?: string;

  /**
   * A flag that determines whether or not to load the
   * file system information.
   *
   * This is true by default.
   */
  stat?: boolean;
}

/**
 * Represents options for directory walking.
 */
export interface IZFileSystemWalkOptions {
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
 * Represents a service to enumerate the file system.
 */
export interface IZFileSystemService {
  /**
   * Gets information about a node.
   *
   * @param path -
   *        The path to get information for.
   *
   * @returns
   *        Information about the node.
   */
  info(path: string): Promise<IZFileSystemNode>;

  /**
   * Reads all nodes that match a pattern.
   *
   * @param pattern -
   *        The pattern string to match against.
   * @param options -
   *        The options for the search.
   *
   * @returns
   *        A list of path strings that match the given patterns.
   */
  search(
    pattern: string,
    options?: IZFileSystemSearchOptions,
  ): Promise<IZFileSystemNode[]>;

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
   * const service = new ZFileSystemService();
   * const vscode = service.walk('.vscode');
   *
   * // Walk the directory tree from the current script and find the .config folder.
   * const config = service.walk('.config', { start: __dirname });
   *
   * // Walk the directory tree from the current script and stop when we reach
   * // at most 2 directories up.
   * const start = __dirname;
   * const stop = resolve(__dirname, '../..');
   * const file = service.walk('path/to/file.json', { start, stop });
   * ```
   */
  walk(
    search: string,
    options?: IZFileSystemWalkOptions,
  ): Promise<string | null>;
}

/**
 * Represents a node implementation of a file system service.
 */
export class ZFileSystemService implements IZFileSystemService {
  public async info(path: string): Promise<IZFileSystemNode> {
    const [file] = await this.search(path);
    return file;
  }

  public async search(
    pattern: string | string[],
    options?: IZFileSystemSearchOptions,
  ): Promise<IZFileSystemNode[]> {
    const paths = await glob(pattern, {
      stat: true,
      ...options,
      withFileTypes: true,
    });

    return paths.map((path) => {
      let info = new ZFileSystemNodeBuilder()
        .path(path.fullpath())
        .created(path.birthtime)
        .updated(path.atime)
        .size(path.size);

      // Note that for folders, node will return the size of the underlying OS metadata,
      // hence, why we remove the size on the folder here.
      info = path.isFile() ? info.file() : info.folder().size(undefined);

      return info.build();
    });
  }

  public async walk(search: string, options?: IZFileSystemWalkOptions) {
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
}
