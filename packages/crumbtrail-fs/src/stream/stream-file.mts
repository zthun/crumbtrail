import type { PathLike } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { noop } from "lodash-es";
import { dirname } from "path";
import { resolvePathLike } from "../resolve-path-like/resolve-path-like.js";
import type { IZStreamWrite } from "./stream-write.mjs";

/**
 * A stream that can read and write a file.
 */
export class ZStreamFile implements IZStreamWrite {
  public async write(
    path: PathLike,
    buffer: Buffer = Buffer.from(""),
  ): Promise<number> {
    const _path = resolvePathLike(path);
    const directory = dirname(_path);

    await mkdir(directory, { recursive: true }).catch(noop);
    await writeFile(path, buffer, { flush: true });

    return buffer.length;
  }
}
