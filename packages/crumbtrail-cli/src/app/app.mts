import type { IZLogger } from "@zthun/lumberjacky-log";
import { ZLoggerContext } from "@zthun/lumberjacky-log";
import { uniq } from "lodash-es";
import { cwd } from "node:process";
import type { IZCrumbtrailAppArguments } from "./app-arguments.mjs";

/**
 * The root application for the crumbtrail cli.
 */
export class ZCrumbtrailApp {
  private _logger: IZLogger;
  private _watching: string | undefined;
  private _globs: string[] | undefined;

  /**
   * Gets the current directory being watched.
   *
   * @returns
   *        The directory that is watching for events.
   */
  public watching() {
    return Promise.resolve(this._watching);
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
  public kill(): Promise<void> {
    delete this._watching;
    delete this._globs;

    return Promise.resolve();
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
  public run(args: IZCrumbtrailAppArguments = {}): Promise<number> {
    const { directory = cwd(), globs = ["**"] } = args;

    this._watching = directory;
    this._globs = uniq(globs.slice());
    this._globs = this._globs.length ? this._globs : ["**"];

    return Promise.resolve(0);
  }
}
