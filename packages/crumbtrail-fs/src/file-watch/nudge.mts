import glob from "fast-glob";
import { noop } from "lodash-es";
import { readdir } from "node:fs/promises";
import { dirname } from "node:path";

/**
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
 */
export async function nudge(path: string) {
  await readdir(dirname(path)).catch(noop);
  await glob(`${path}/**`, { onlyDirectories: true }).catch(noop);
}
