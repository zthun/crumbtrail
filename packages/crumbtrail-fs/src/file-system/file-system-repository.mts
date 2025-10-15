import { flatten, uniqBy } from "lodash-es";
import { cwd } from "node:process";
import type { IZFileSystemNode } from "./file-system-node.mjs";
import type { IZFileSystemService } from "./file-system-service.mjs";

/**
 * Options for watching and retrieving files from the file system.
 */
export interface IZFileSystemRepositoryOptions {
  /**
   * The path to watch.
   *
   * If this is falsy, then the actual cwd is used
   * from node.
   */
  path?: string;
  /**
   * Glob patterns of files to include in the retrieval.
   */
  globs?: string[];
}

/**
 * Represents a cache system for a file system to quickly retrieve files and folders.
 *
 * This class watches the file system and updates itself internally when it detects changes.
 * This is built on top of a file system service and a file system watcher.
 */
export class ZFileSystemRepository {
  private _nodes: IZFileSystemNode[] = [];
  private _current: Promise<IZFileSystemNode[]>;

  /**
   * Initializes a new instance of this object.
   *
   * @param _directory -
   *        The directory to cache.
   *
   * @param _search -
   *        The search glob pattern to match and cache.
   */
  public constructor(
    private readonly service: IZFileSystemService,
    options: IZFileSystemRepositoryOptions = {},
  ) {
    const { path = cwd(), globs = ["**"] } = options;

    this._current = Promise.resolve()
      .then(() => {
        const searches = globs.map((g) =>
          this.service.search(g, {
            cwd: path,
            stat: true,
          }),
        );
        return Promise.all(searches);
      })
      .then((results) => {
        return uniqBy(flatten(results), (n) => n.path);
      })
      .then((found) => {
        this._nodes = found;
        return this._nodes;
      });
  }

  /**
   * Waits for a current job to finish its execution.
   */
  public async flush() {
    await this._current;
  }

  /**
   * Destroys this repository.
   *
   * Cancels any watch jobs and sets the node list to empty.
   * This method is idempotent.  If this object is already
   * destroyed, then this method does nothing.
   */
  public async destroy() {
    await this.flush();
    this._nodes = [];
  }

  /**
   * Gets the list of the system nodes that have been found.
   */
  public async list(): Promise<IZFileSystemNode[]> {
    await this.flush();
    return this._nodes;
  }
}
