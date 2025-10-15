import { resolve } from "node:path";
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
      const target = createTestTarget({ path: assets, globs: ["*.*"] });

      // Act.
      const nodes = await target.list();
      const actual = nodes.map((n) => n.path).sort();

      // Assert.
      expect(actual).toEqual(files);
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
