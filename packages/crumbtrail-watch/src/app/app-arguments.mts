/**
 * Arguments for the crumbtrail app.
 */
export interface IZCrumbtrailAppArguments {
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
