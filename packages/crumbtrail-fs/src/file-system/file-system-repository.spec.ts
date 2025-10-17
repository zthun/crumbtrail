import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { ZStreamFile } from "../stream/stream-file.mjs";
import type { IZFileSystemRepositoryOptions } from "./file-system-repository.mjs";
import { ZFileSystemRepository } from "./file-system-repository.mjs";
import { ZFileSystemService } from "./file-system-service.mjs";

describe.sequential("ZFileSystemRepository", () => {
  const assets = resolve(__dirname, "../../.test");
  const writer = new ZStreamFile();

  let _target: ZFileSystemRepository | undefined;

  const createTestTarget = (options?: IZFileSystemRepositoryOptions) => {
    _target = new ZFileSystemRepository(new ZFileSystemService(), options);

    return _target;
  };

  beforeEach(async () => {
    await rm(assets, { recursive: true, force: true });
  });

  afterEach(async () => {
    await _target?.destroy();
  });

  afterAll(async () => {
    await rm(assets, { recursive: true, force: true });
  });

  describe.sequential("All files", () => {
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
      const json = resolve(assets, `${randomUUID()}.json`);
      const xml = resolve(assets, randomUUID(), `${randomUUID()}.xml`);
      await writer.write(json);
      await writer.write(xml);
      const target = createTestTarget({
        path: assets,
        globs: ["**/*.*"],
      });

      // Act.
      const nodes = await target.list();
      const actual = nodes.map((n) => n.path);

      // Assert.
      expect(actual).toContain(xml);
      expect(actual).toContain(json);
    });
  });

  describe.sequential("Destroy", () => {
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
