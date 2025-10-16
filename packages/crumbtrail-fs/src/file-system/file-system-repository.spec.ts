import { createGuid, sleep } from "@zthun/helpful-fn";
import { findIndex } from "lodash-es";
import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { ZStreamFile } from "../stream/stream-file.js";
import type { IZFileSystemRepositoryOptions } from "./file-system-repository.mjs";
import { ZFileSystemRepository } from "./file-system-repository.mjs";
import { ZFileSystemService } from "./file-system-service.mjs";

describe.sequential("ZFileSystemRepository", () => {
  const assets = resolve(__dirname, "../../.test");
  const delay = 2500;
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
      const json = resolve(assets, `${createGuid()}.json`);
      const xml = resolve(assets, createGuid(), `${createGuid()}.xml`);
      await writer.write(json);
      await writer.write(xml);
      const target = createTestTarget({
        path: assets,
        globs: ["**/*.*"],
        ignore: true,
      });

      // Act.
      const nodes = await target.list();
      const actual = nodes.map((n) => n.path);

      // Assert.
      expect(actual).toContain(xml);
      expect(actual).toContain(json);
    });
  });

  describe.sequential("Mutations", () => {
    it("should add a file to the list when a file is added", async () => {
      // Arrange.
      const folder = resolve(assets, createGuid());
      const newFile = resolve(folder, `${createGuid()}.json`);
      const contents = "File Contents";
      const target = createTestTarget({ path: assets, globs: ["**/*.*"] });
      await target.flush();

      // Act.
      await writer.write(newFile, Buffer.from(contents));
      await sleep(delay);
      const nodes = await target.list();
      const actual = findIndex(nodes, (n) => n.path === newFile);

      // Assert.
      expect(actual).toBeGreaterThanOrEqual(0);
    });

    it("should not add a file to the list when the file does not match the glob pattern", async () => {
      // Arrange.
      const folder = resolve(assets, createGuid());
      const newFile = resolve(folder, `${createGuid()}.json`);
      const contents = "File Contents";
      const target = createTestTarget({ path: assets, globs: ["**/*.xml"] });
      await target.flush();

      // Act.
      await writer.write(newFile, Buffer.from(contents));
      await sleep(delay);
      const nodes = await target.list();
      const actual = findIndex(nodes, (n) => n.path === newFile);
      await rm(folder, { recursive: true, force: true });

      // Assert.
      expect(actual).toBeLessThan(0);
    });

    it("should add a folder to the list when a folder is added and matches the glob pattern", async () => {
      // Arrange.
      const folder = resolve(assets, createGuid());
      const target = createTestTarget({ path: assets, globs: ["**"] });
      await target.flush();

      // Act.
      await mkdir(folder, { recursive: true });
      await sleep(delay);
      const nodes = await target.list();
      const actual = findIndex(nodes, (n) => n.path === folder);
      await rm(folder, { recursive: true, force: true });

      // Assert.
      expect(actual).toBeGreaterThanOrEqual(0);
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
