import { glob } from "glob";
import {
  IZFileSystemNode,
  ZFileSystemNodeBuilder,
} from "./file-system-node.mjs";

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
      ...options,
      stat: true,
      withFileTypes: true,
    });

    return paths.map((path) => {
      let info = new ZFileSystemNodeBuilder()
        .path(path.fullpath())
        .created(path.birthtime)
        .updated(path.atime)
        .size(path.size);

      // Note that for folders, node will return the size of the underlying OS metadata,
      // hence, why we 0 out the size on a folder here.
      info = path.isFile() ? info.file() : info.folder().size(undefined);

      return info.build();
    });
  }
}
