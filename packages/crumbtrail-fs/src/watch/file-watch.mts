import type { FSWatcher } from "chokidar";
import { watch } from "chokidar";
import { resolve } from "node:path";
import type { Observable } from "rxjs";
import { Subject } from "rxjs";

/**
 * Represents and object that can watch a folder or file on the file system.
 */
export interface IZFileWatch {
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
  add(): Observable<string>;

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
  update(): Observable<string>;

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
   *        that are unlinked and removed respectively.
   */
  remove(): Observable<string>;
}

/**
 * An implementation of the IZFileWatch using basic node apis.
 */
export class ZFileWatch implements IZFileWatch {
  private _add: Subject<string> = new Subject<string>();
  private _update: Subject<string> = new Subject<string>();
  private _remove: Subject<string> = new Subject<string>();
  private _watcher: FSWatcher | undefined;

  /**
   * Initializes a new instance of this object.
   *
   * @param path -
   *        The path to watch.
   */
  public constructor(public readonly path: string) {}

  public async start() {
    this._watcher = watch(this.path, {
      usePolling: true,
      alwaysStat: true,
      ignoreInitial: true,
      ignorePermissionErrors: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 50,
      },
    });

    this._watcher
      .on("add", (f) => {
        this._add.next(resolve(this.path, f));
      })
      .on("addDir", (f) => {
        this._add.next(resolve(this.path, f));
      })
      .on("change", (f) => {
        this._update.next(resolve(this.path, f));
      })
      .on("unlink", (f) => {
        this._remove.next(resolve(this.path, f));
      })
      .on("unlinkDir", (f) => {
        this._remove.next(resolve(this.path, f));
      });

    return new Promise<void>((resolve) =>
      this._watcher?.on("ready", () => resolve()),
    );
  }

  public async stop() {
    await this._watcher?.close();
    delete this._watcher;
    return Promise.resolve();
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
