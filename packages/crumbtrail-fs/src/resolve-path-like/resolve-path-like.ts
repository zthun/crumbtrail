import type { PathLike } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function resolvePathLike(path: PathLike): string {
  if (typeof path === "string") {
    return resolve(path);
  }

  if (path instanceof URL) {
    return fileURLToPath(path);
  }

  return resolve(path.toString());
}
