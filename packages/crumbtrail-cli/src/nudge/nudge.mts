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
   * Default is 1.5 seconds.
   */
  every?: number;
}

export class ZCrumbtrailNudge {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public run(_: IZCrumbtrailNudgeOptions = {}): Promise<number> {
    throw new Error("Not implemented yet");
  }
}
