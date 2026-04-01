import { readdir } from "node:fs/promises";
import { dirname } from "node:path";

import { ZWatchDelay } from "@zthun/crumbtrail-fs";
import { firstTruthy, sleep } from "@zthun/helpful-fn";
import type { IZLogger } from "@zthun/lumberjacky-log";
import { ZLogEntryBuilder, ZLoggerContext } from "@zthun/lumberjacky-log";
import glob from "fast-glob";
import { noop } from "lodash-es";

/**
 * Options for the nudge command.
 */
export interface IZCrumbtrailNudgeOptions {
  /**
   * The directory to nudge.
   *
   * The default if not specified is the current working directory.
   */
  directory?: string;

  /**
   * Whether to nudge recursively.
   *
   * Warning:  This can have severe CPU
   * usage for deep directories.
   *
   * Default is false.
   */
  recursive?: boolean;

  /**
   * The total number of milliseconds to wait
   * between nudges.
   *
   * Default is {@link ZWatchDelay}
   */
  every?: number;
}

/**
 * An operation to continuously nudge a directory.
 *
 * This is a special operation that lists the contents of a targeted parent directory.
 * The main reason for this is to work around an issue when you are running inside of
 * a container and your host is not linux.
 *
 * A lot of times, you will not receive events in this situation for add and update
 * until the virtual file bridge is refreshed by listing the outer directory contents.
 * This command helps to force the bridge to send file change events.  You should
 * only need this if you are running on a non linux host inside a docker container.
 *
 * Run a separate container in the background and just nudge the directory
 * for however long you need.
 */
export class ZCrumbtrailNudge {
  private _controller?: AbortController;
  private _resolve?: (val: number) => void;
  private _promise?: Promise<number>;
  private readonly _logger: IZLogger;

  public constructor(logger: IZLogger) {
    this._logger = new ZLoggerContext("ZCrumbtrailNudge", logger);
  }

  public async kill(): Promise<void> {
    this._controller?.abort();
    delete this._controller;

    await this._promise;
    delete this._promise;
  }

  public async run(options: IZCrumbtrailNudgeOptions = {}): Promise<number> {
    await this.kill();

    const controller = new AbortController();
    this._controller = controller;

    const { promise, resolve } = Promise.withResolvers<number>();
    this._promise = promise;
    this._resolve = resolve;

    const {
      directory = process.cwd(),
      recursive,
      every = ZWatchDelay,
    } = options;

    const ms = firstTruthy(ZWatchDelay, every);

    this._logger.log(
      new ZLogEntryBuilder()
        .info()
        .message(`Starting a nudge loop every ${ms} milliseconds`)
        .build(),
    );

    if (recursive) {
      this._logger.log(
        new ZLogEntryBuilder()
          .warning()
          .message("Nudging is recursive.  Child folders will be nudged too.")
          .build(),
      );
    }

    do {
      this._logger.log(
        new ZLogEntryBuilder()
          .info()
          .message(`Nudging ${directory} to refresh`)
          .build(),
      );
      await readdir(dirname(directory)).catch(noop);

      if (recursive) {
        await glob(`${directory}/**`, { onlyDirectories: true }).catch(noop);
      }

      await sleep(ms);
    } while (!controller.signal.aborted);

    resolve(0);
    delete this._resolve;

    return this._promise;
  }
}
