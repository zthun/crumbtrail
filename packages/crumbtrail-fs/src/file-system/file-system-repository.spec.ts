import { sleep } from "@zthun/helpful-fn";
import { findIndex } from "lodash-es";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { ZStreamFile } from "src/stream/stream-file.js";
import { afterEach, describe, expect, it } from "vitest";
import type { IZFileSystemRepositoryOptions } from "./file-system-repository.mjs";
import { ZFileSystemRepository } from "./file-system-repository.mjs";
import { ZFileSystemService } from "./file-system-service.mjs";

describe("ZFileSystemRepository", () => {
  const assets = resolve(__dirname, "../../assets");
  const files = [resolve(assets, "test.json"), resolve(assets, "test.xml")];

  let _target: ZFileSystemRepository | undefined;

  const createTestTarget = (options?: IZFileSystemRepositoryOptions) => {
    _target = new ZFileSystemRepository(new ZFileSystemService(), options);

    return _target;
  };

  afterEach(async () => {
    await _target?.destroy();
  });

  describe("All files", () => {
    it("should list all files in the current working directory", async () => {
      // Arrange.
      const target = createTestTarget();

      // Act.
      const nodes = await target.list();

      // Assert.
      expect(nodes.length).toBeGreaterThan(0);
    });

    it("should list all files in the target directory", async () => {
      // Arrange.
      const target = createTestTarget({
        path: assets,
        globs: ["*.*"],
        ignore: true,
      });

      // Act.
      const nodes = await target.list();
      const actual = nodes.map((n) => n.path).sort();

      // Assert.
      expect(actual).toEqual(files);
    });
  });

  describe.sequential("Mutations", () => {
    it("should add a file to the list when a file is added", async () => {
      // Arrange.
      const writer = new ZStreamFile();
      const folder = resolve(assets, "temp");
      const newFile = resolve(folder, "_tmp.json");
      const contents = "File Contents";
      const target = createTestTarget({
        path: assets,
      });
      await target.flush();

      // Act.
      await writer.write(newFile, Buffer.from(contents));
      await sleep(1000);
      const nodes = await target.list();
      const actual = findIndex(nodes, (n) => n.path === newFile);
      await rm(folder, { recursive: true, force: true });

      // Assert.
      expect(actual).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Destroy", () => {
    it("should remove the list of nodes", async () => {
      // Arrange.
      const target = createTestTarget();

      // Act
      await target.destroy();
      const actual = await target.list();

      // Assert.
      expect(actual).toEqual([]);
    });

    it("should be idempotent", async () => {
      // Arrange.
      const target = createTestTarget();

      // Act
      await target.destroy();
      await target.destroy();
      await target.destroy();

      // Assert.
      await expect(target.destroy()).resolves.toBeUndefined();
    });
  });
});
