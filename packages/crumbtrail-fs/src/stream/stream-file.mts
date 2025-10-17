import type { PathLike } from "fs";
import { writeFile } from "fs/promises";
import { dirname } from "path";
import { resolvePathLike } from "../resolve-path-like/resolve-path-like.js";
import { ZStreamFolder } from "./stream-folder.mjs";
import type { IZStreamWrite, IZStreamWriteOptions } from "./stream-write.mjs";

/**
 * A stream that can read and write to files.
 */
export class ZStreamFile implements IZStreamWrite {
  public async write(
    path: PathLike,
    { buffer = Buffer.from("") }: IZStreamWriteOptions = {},
  ): Promise<number> {
    const _path = resolvePathLike(path);
    const directory = dirname(_path);

    await new ZStreamFolder().write(directory);
    await writeFile(path, buffer, { flush: true });

    return buffer.length;
  }
}
