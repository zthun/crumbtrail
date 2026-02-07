import type { IZFileSystemNode } from "@zthun/crumbtrail-fs";
import { ZFileWatch } from "@zthun/crumbtrail-fs";
import { firstDefined } from "@zthun/helpful-fn";
import type { IZLogEntry, IZLogger } from "@zthun/lumberjacky-log";
import { ZLogEntryBuilder, ZLoggerContext } from "@zthun/lumberjacky-log";
import { uniq } from "lodash-es";
import { minimatch } from "minimatch";
import { resolve } from "node:path";
import { cwd } from "node:process";

/**
 * Arguments for the crumbtrail app.
 */
export interface IZCrumbtrailWatchOptions {
  /**
   * The directory to watch.
   *
   * If this is falsy, then the cwd is used.
   */
  directory?: string;

  /**
   * The list of file globs to watch.
   *
   * If this is falsy or empty, then '**' is used.
   */
  globs?: string[];
}

/**
 * The root application for the crumbtrail cli.
 */
export class ZCrumbtrailWatch {
  private _logger: IZLogger;
  private _globs: string[] | undefined;
  private _watch: ZFileWatch | undefined;
  private _ready: Promise<void> = Promise.resolve();
  private _promise: Promise<number> | undefined;
  private _resolve: ((value: number) => void) | undefined;

  /**
   * Gets the entry for a basic information message.
   *
   * @returns
   *        The log entry for a basic information message.
   */
  public static msg(msg: string): IZLogEntry {
    return new ZLogEntryBuilder().info().message(msg).build();
  }

  /**
   * Gets the message for when a file is added.
   *
   * @returns
   *        The message for when a file is added.
   */
  public static add(path: string): IZLogEntry {
    return new ZLogEntryBuilder().info().message(`Node added: ${path}`).build();
  }

  /**
   * Gets the message for when a file/folder is removed.
   *
   * @returns
   *        The message for when a file/folder is added.
   */
  public static remove(path: string): IZLogEntry {
    return new ZLogEntryBuilder()
      .warning()
      .message(`Node removed: ${path}`)
      .build();
  }

  /**
   * Gets the message for when a file is updated.
   *
   * @returns
   *        The message for when a file is updated.
   */
  public static update(path: string): IZLogEntry {
    return new ZLogEntryBuilder()
      .info()
      .message(`Node updated: ${path}`)
      .build();
  }

  /**
   * Gets the current directory being watched.
   *
   * @returns
   *        The directory that is watching for events.
   */
  public watching() {
    return Promise.resolve(this._watch?.path);
  }

  /**
   * Gets the list of globs that filter the directory contents.
   *
   * @returns
   *      The list of globs that filter the directory contents.
   */
  public globs() {
    return Promise.resolve(this._globs?.slice());
  }

  /**
   * Returns a promise that can be awaited on to
   * make sure the watch is initialized.
   */
  public async ready() {
    return this._ready;
  }

  /**
   * Initializes a new instance of this object.
   *
   * @param logger -
   *        The logger to use to output events.
   */
  public constructor(logger: IZLogger) {
    this._logger = new ZLoggerContext("ZCrumbtrailApp", logger);
  }

  /**
   * Kills the application.
   */
  public async kill(): Promise<void> {
    await this._watch?.stop();

    delete this._watch;
    delete this._globs;
    this._ready = Promise.resolve();

    this._resolve?.(0);
    await this._promise;
    delete this._promise;
  }

  private _handleFsEvent(path: string, entry: IZLogEntry) {
    const globs = firstDefined(["**"], this._globs);
    const directory = firstDefined(cwd(), this._watch?.path);

    if (globs?.some((g) => minimatch(path, resolve(directory, g)))) {
      this._logger.log(entry);
    }
  }

  private _handleAdd(node: IZFileSystemNode) {
    const { add } = ZCrumbtrailWatch;
    this._handleFsEvent(node.path, add(node.path));
  }

  private _handleRemove(node: IZFileSystemNode) {
    const { remove } = ZCrumbtrailWatch;
    this._handleFsEvent(node.path, remove(node.path));
  }

  private _handleUpdate(node: IZFileSystemNode) {
    const { update } = ZCrumbtrailWatch;
    this._handleFsEvent(node.path, update(node.path));
  }

  /**
   * Runs the application.
   *
   * @param args -
   *        The application arguments.
   *
   * @returns
   *        The process exit code.
   */
  public async run(args: IZCrumbtrailWatchOptions = {}): Promise<number> {
    if (this._promise) {
      return this._promise;
    }

    const { promise, resolve } = Promise.withResolvers<number>();
    this._resolve = resolve;
    this._promise = promise;

    const { msg } = ZCrumbtrailWatch;
    const { directory = cwd(), globs = ["**"] } = args;

    this._globs = uniq(globs.slice());
    this._globs = this._globs.length ? this._globs : ["**"];
    this._watch = new ZFileWatch(directory);

    const filter = globs.join(",");
    this._logger.log(msg("Welcome to Crumbtrail CLI"));
    this._logger.log(msg(`You are now watching ${directory}`));
    this._logger.log(msg(`Files that match ${filter} will be logged here.`));
    this._logger.log(msg("Press Ctrl+C to stop watching"));

    this._watch.add().subscribe(this._handleAdd.bind(this));
    this._watch.remove().subscribe(this._handleRemove.bind(this));
    this._watch.update().subscribe(this._handleUpdate.bind(this));

    this._ready = this._watch.start();
    await this._ready;

    return this._promise;
  }
}
