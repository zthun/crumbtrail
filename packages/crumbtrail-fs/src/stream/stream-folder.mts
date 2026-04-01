import type { PathLike } from "fs";
import { mkdir } from "fs/promises";

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
    await mkdir(path, { recursive: true });

    return 0;
  }
}
