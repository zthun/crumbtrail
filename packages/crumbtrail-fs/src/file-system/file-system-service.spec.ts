import { createGuid } from "@zthun/helpful-fn";
import { basename, dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ZFileSystemNodeType } from "./file-system-node.mjs";
import { ZFileSystemService } from "./file-system-service.mjs";

describe("ZFileSystemService", () => {
  const createTestTarget = () => new ZFileSystemService();

  describe("Info", () => {
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
      const pattern = ["file-system/*.ts"];

      // Act.
      const nodes = await target.search(pattern, { cwd });
      const actual = nodes.map((node) => basename(node.path));

      // Assert.
      expect(actual.length).toBeGreaterThanOrEqual(1);
      expect(actual).toContain("file-system-service.spec.ts");
    });

    it("should not read any of the system information if the stat flag is false", async () => {
      // Arrange.
      const target = createTestTarget();
      const cwd = resolve(__dirname, "..");
      const pattern = ["file-system", "file-system/**"];

      // Act.
      const nodes = await target.search(pattern, { cwd, stat: false });
      const actual = nodes.map((node) => node.size).filter((s) => !!s);

      // Assert.
      expect(actual).toEqual([]);
    });
  });

  describe("Walk", () => {
    const currentFile = basename(__filename);
    const assets = "assets";
    const testJson = `${assets}/test.json`;

    it("should find a path from the given cwd", async () => {
      // Arrange.
      const target = createTestTarget();

      // Act.
      const actual = await target.walk("node_modules");

      // Assert.
      expect(actual).toMatch("node_modules");
    });

    it("should find a path if the path is __dirname", async () => {
      // Arrange.
      const target = createTestTarget();

      // Act.
      const actual = await target.walk(__dirname);

      // Assert.
      expect(actual).toMatch(__dirname);
    });

    it("should find a path if the path is __filename", async () => {
      // Arrange.
      const target = createTestTarget();

      // Act.
      const actual = await target.walk(__filename);

      // Assert.
      expect(actual).toMatch(__filename);
    });

    it("should match the path of the current file", async () => {
      // Arrange.
      const target = createTestTarget();

      // Act
      const actual = await target.walk(currentFile, { start: __dirname });

      // Assert
      expect(actual).toEqual(__filename);
    });

    it("should return null if no absolute path can be found", async () => {
      // Arrange.
      const target = createTestTarget();
      const path = "/assets";

      // Act.
      const actual = await target.walk(path);

      // Assert.
      expect(actual).toBeNull();
    });

    it("should return null if no such file exists in the file system", async () => {
      // Arrange.
      const target = createTestTarget();
      const path = createGuid();

      // Act.
      const actual = await target.walk(path);

      // Assert
      expect(actual).toBeNull();
    });

    it("should start at the given start directory", async () => {
      // Arrange.
      const target = createTestTarget();
      const start = dirname(__dirname);

      // Act.
      const actual = await target.walk(currentFile, { start });

      // Assert.
      expect(actual).toBeNull();
    });

    it("should stop at the given stop directory", async () => {
      // Arrange.
      const target = createTestTarget();

      // Act.
      const actual = await target.walk(testJson, {
        start: __dirname,
        stop: __dirname,
      });

      // Assert.
      expect(actual).toBeNull();
    });
  });
});
