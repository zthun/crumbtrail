import type { FSWatcher } from "chokidar";
import { watch } from "chokidar";
import { type Stats } from "node:fs";
import { resolve } from "node:path";
import type { Observable } from "rxjs";
import { Subject } from "rxjs";
import {
  ZFileSystemNodeBuilder,
  type IZFileSystemNode,
} from "../file-system/file-system-node.mjs";
import { nudge } from "./nudge.mjs";

/**
 * Represents and object that can watch a folder or file on the file system.
 */
export interface IZFileWatch {
  /**
   * Starts the watch operation.
   */
  start(): Promise<void>;

  /**
   * Stops the watch operation.
   */
  stop(): Promise<void>;

  /**
   * The stream for files being added.
   *
   * This can only occur if the target being watched
   * is a folder.
   *
   * @returns
   *        The observable that will publish files that
   *        get added.
   */
  add(): Observable<IZFileSystemNode>;

  /**
   * The stream for files being updated.
   *
   * If this watcher points to a folder, then all files
   * recursively will send when they get updated.  If this
   * watcher points to a file, then this will only invoke
   * when the file is updated.
   *
   * @returns
   *        The observable that will publish files and folders
   *        that are updated.
   */
  update(): Observable<IZFileSystemNode>;

  /**
   * The stream for files and folders being deleted.
   *
   * If this watcher points to a folder, then all files under the
   * folder will be sent through this observable, including the
   * folder being watched.  If this points to a file, then
   * this will only receive when the file is unlinked.
   *
   * @returns
   *        The observable that will publish file and folders
   *        that are unlinked and removed respectively.  Note
   *        that files and folders streamed this way will not
   *        have their stats set.
   */
  remove(): Observable<IZFileSystemNode>;
}

/**
 * An implementation of the IZFileWatch.
 */
export class ZFileWatch implements IZFileWatch {
  private _add: Subject<IZFileSystemNode> = new Subject<IZFileSystemNode>();
  private _update: Subject<IZFileSystemNode> = new Subject<IZFileSystemNode>();
  private _remove: Subject<IZFileSystemNode> = new Subject<IZFileSystemNode>();
  private _watcher: FSWatcher | undefined;
  private _controller: AbortController | undefined;

  /**
   * Initializes a new instance of this object.
   *
   * @param path -
   *        The path to watch.
   */
  public constructor(public readonly path: string) {}

  public async start() {
    await this.stop();

    this._watcher = watch(this.path, {
      usePolling: true,
      alwaysStat: true,
      ignoreInitial: true,

      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 50,
      },
    });

    function next(
      observable: Subject<IZFileSystemNode>,
      file: string,
      stats: Stats | undefined,
    ) {
      const node = new ZFileSystemNodeBuilder().path(resolve(this.path, file));
      observable.next(stats ? node.stats(stats).build() : node.build());
    }

    this._watcher
      .on("add", next.bind(this, this._add))
      .on("addDir", next.bind(this, this._add))
      .on("change", next.bind(this, this._update))
      .on("unlink", next.bind(this, this._remove))
      .on("unlinkDir", next.bind(this, this._remove));

    // See the documentation for nudge for why this is here.
    this._controller = nudge(this.path);

    return new Promise<void>((resolve) =>
      this._watcher?.on("ready", () => resolve()),
    );
  }

  public async stop() {
    this._controller?.abort();
    delete this._controller;

    await this._watcher?.close();
    delete this._watcher;
  }

  public add() {
    return this._add.asObservable();
  }

  public update() {
    return this._update.asObservable();
  }

  public remove() {
    return this._remove.asObservable();
  }
}
