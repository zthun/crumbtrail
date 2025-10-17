import type { PathLike } from "fs";
import { mkdir, stat } from "fs/promises";
import type { IZStreamWrite } from "./stream-write.mjs";

/**
 * A stream that writes folders.
 *
 * Writing folders is idempotent.  If the folder you
 * are trying to write already exists, then the write
 * operation still succeeds
 */
export class ZStreamFolder implements IZStreamWrite {
  public async write(path: PathLike): Promise<number> {
    try {
      await mkdir(path, { recursive: true });
    } catch {
      // The folder may exist, but if it is a file then
      // we have a conflict and in that case, we will throw an
      // error.  We are going to let stat fail if it cannot
      // access the path (permission error).
      const stats = await stat(path);

      if (stats.isFile()) {
        const msg = `Cannot create folder, ${path}, because a file with the same name exists at the target location`;
        throw new Error(msg);
      }
    }

    return 0;
  }
}
