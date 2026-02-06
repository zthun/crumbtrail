import { sleep } from "@zthun/helpful-fn";
import glob from "fast-glob";
import { noop } from "lodash-es";
import { readdir } from "node:fs/promises";
import { dirname } from "node:path";
import { ZWatchDelay } from "../sleep-watch-delay/sleep-watch-delay.mjs";

/**
 * Starts a nudging poll loop on the given path's parent
 * directory.
 *
 * This is a workaround to an annoying issue when
 * running in a container with mounted volumes.
 *
 * If you are running a linux container and you are on a
 * Windows or Mac host, the files are shared
 * with a virtual bridge when the volumes are mounted
 * and this will not raise an add event without someone
 * or something listing the contents of the parent
 * directory.
 *
 * @param path
 *        The path to nudge.
 *
 * @returns
 *        A controller that can be used to
 *        stop the nudge from processing.
 *
 */
export function nudge(path: string) {
  const controller = new AbortController();

  void (async () => {
    do {
      await readdir(dirname(path)).catch(noop);
      await glob(`${path}/**`, { onlyDirectories: true }).catch(noop);
      await sleep(ZWatchDelay * 0.9);
    } while (!controller.signal.aborted);
  })();

  return controller;
}
