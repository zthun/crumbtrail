import { flatten, uniqBy } from "lodash-es";
import { cwd } from "node:process";
import { type IZFileSystemNode } from "./file-system-node.mjs";
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
   *
   * If this is falsy, then [**] will be used.
   */
  globs?: string[];
}

/**
 * Represents a cache system for a file system to quickly retrieve files and folders.
 */
export class ZFileSystemRepository {
  private _nodes: IZFileSystemNode[] = [];
  private _current: Promise<IZFileSystemNode[]> = Promise.resolve([]);

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
        // We have to concat the existing nodes list in the case that a file
        // was added while the search was happening
        const discovered = flatten(results).concat(this._nodes);
        this._nodes = uniqBy(discovered, (n) => n.path);
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
   * Sets the node list to empty. This method is idempotent.
   * If this object is already destroyed, then this method
   * does nothing.
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
