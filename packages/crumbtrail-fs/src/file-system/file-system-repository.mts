import { watch, type FSWatcher } from "chokidar";
import { flatten, uniqBy } from "lodash-es";
import { minimatch } from "minimatch";
import { resolve } from "node:path";
import { cwd } from "node:process";
import {
  ZFileSystemNodeBuilder,
  type IZFileSystemNode,
} from "./file-system-node.mjs";
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
 *
 * This class watches the file system and updates itself internally when it detects changes.
 * This is built on top of a file system service and a file system watcher.
 */
export class ZFileSystemRepository {
  private _nodes: IZFileSystemNode[] = [];
  private _current: Promise<IZFileSystemNode[]> = Promise.resolve([]);
  private _watcher: FSWatcher | null = null;

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

    this._watcher = watch(path, {
      ignoreInitial: true,
      awaitWriteFinish: false,
    });

    const onAddNode = (target: string) => {
      if (globs.some((g) => minimatch(target, resolve(path, g)))) {
        const newFile = new ZFileSystemNodeBuilder().path(target).build();
        this._nodes.push(newFile);
      }
    };

    this._watcher.on("add", onAddNode);
    this._watcher.on("addDir", onAddNode);

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
   * Cancels any watch jobs and sets the node list to empty.
   * This method is idempotent.  If this object is already
   * destroyed, then this method does nothing.
   */
  public async destroy() {
    await this._watcher?.close();
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
