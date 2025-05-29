import { basename, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ZFileSystemNodeType } from "./file-system-node.mjs";
import { ZFileSystemService } from "./file-system-service.mjs";

describe("ZFileSystemService", () => {
  const createTestTarget = () => new ZFileSystemService();

  describe("Get", () => {
    it("should read file information", async () => {
      // Arrange.
      const target = createTestTarget();
      const path = __filename;

      // Act.
      const info = await target.info(path);

      // Assert.
      expect(info.created).toBeDefined();
      expect(info.updated).toBeDefined();
      expect(info.size).toBeDefined();
      expect(info.type).toEqual(ZFileSystemNodeType.File);
    });

    it("should read folder information", async () => {
      // Arrange.
      const target = createTestTarget();
      const path = __dirname;

      // Act.
      const info = await target.info(path);

      // Assert.
      expect(info.created).toBeDefined();
      expect(info.updated).toBeDefined();
      expect(info.size).toBeUndefined();
      expect(info.type).toEqual(ZFileSystemNodeType.Folder);
    });
  });

  describe("Search", () => {
    it("should read all files in a directory that match a given pattern", async () => {
      // Arrange.
      const target = createTestTarget();
      const cwd = resolve(__dirname, "..");
      const pattern = ["walk/", "file-system/*.ts"];

      // Act.
      const nodes = await target.search(pattern, { cwd });
      const actual = nodes.map((node) => basename(node.path));

      // Assert.
      expect(actual.length).toBeGreaterThanOrEqual(1);
      expect(actual).toContain("walk");
      expect(actual).toContain("file-system-service.spec.ts");
    });
  });
});
