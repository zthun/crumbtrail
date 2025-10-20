import { sleep } from "@zthun/helpful-fn";

/**
 * The actual delay time that you should wait for a watch
 * operation to pick up your file changes.
 */
export const ZWatchDelay = 1500;

/**
 * Performs a sleep long enough to allow a watch operation
 * to pick up a change.
 *
 * You should never really need this.  Where it is useful
 * is for unit testing with IO operations and you want to
 * wait for your write operations to get picked up by
 * a file watch operation.
 */
export function sleepWatchDelay() {
  return sleep(ZWatchDelay);
}
