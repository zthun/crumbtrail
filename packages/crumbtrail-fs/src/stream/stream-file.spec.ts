import { createGuid } from "@zthun/helpful-fn";
import { readFile, rm, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { beforeEach } from "node:test";
import { afterAll, describe, expect, it } from "vitest";
import type { IZStreamFileOptions } from "./stream-file.mjs";
import { ZStreamFile } from "./stream-file.mjs";

describe.sequential("ZStreamFile", () => {
  const assets = resolve(__dirname, "../../.test.stream-file");
  const file = resolve(assets, `${createGuid()}.json`);

  const createTestTarget = (options?: IZStreamFileOptions) =>
    new ZStreamFile(options);

  beforeEach(async () => {
    await rm(assets, { recursive: true, force: true });
  });

  afterAll(async () => {
    await rm(assets, { recursive: true, force: true });
  });

  describe.sequential("Read", () => {
    const originalFileContents = "Original File Contents";

    const createWrittenTestTarget = async (options?: IZStreamFileOptions) => {
      const _target = createTestTarget(options);
      await _target.write(file, { buffer: Buffer.from(originalFileContents) });

      return _target;
    };

    it("should read file contents", async () => {
      // Arrange.
      const controller = new AbortController();
      const target = await createWrittenTestTarget({ cache: { maxFiles: 0 } });

      // Act.
      const buffer = await target.read(file, { signal: controller.signal });
      const actual = buffer.toString();

      // Assert.
      expect(actual).toEqual(originalFileContents);
    });

    it("should read large files", async () => {
      // Arrange.
      const target = await createWrittenTestTarget({ cache: { fileSize: 1n } });

      // Act.
      const buffer = await target.read(file);
      const actual = buffer.toString();

      // Assert.
      expect(actual).toEqual(originalFileContents);
    });

    it("should return the same file contents if the file has not been updated", async () => {
      // Arrange.
      const target = await createWrittenTestTarget();
      await target.read(file);

      // Act.
      const buffer = await target.read(file);
      const actual = buffer.toString();

      // Assert.
      expect(actual).toEqual(originalFileContents);
    });

    it("should return updated file contents if the file date has changed", async () => {
      // Arrange.
      const updatedFileContents = "New Contents";
      const target = await createWrittenTestTarget();
      await target.read(file);

      // Act.
      await writeFile(file, updatedFileContents);
      const buffer = await target.read(file);
      const actual = buffer.toString();

      // Assert.
      expect(actual).toEqual(updatedFileContents);
    });
  });

  describe.sequential("Write", () => {
    it("should create the file if not writing any data", async () => {
      // Arrange
      const target = createTestTarget();

      // Act.
      await target.write(file);

      // Assert.
      await expect(unlink(file)).resolves.toBeUndefined();
    });

    it("should create the file and write the contents", async () => {
      // Arrange.
      const contents = "Should be written to the file";
      const target = createTestTarget();

      // Act.
      await target.write(file, { buffer: Buffer.from(contents) });
      const buffer = await readFile(file);
      const actual = buffer.toString();

      // Assert.
      await expect(unlink(file)).resolves.toBeUndefined();
      expect(actual).toEqual(contents);
    });

    it("should update the contents of an existing file", async () => {
      // Arrange.
      const contents = "Should be written to existing file";
      const target = createTestTarget();

      // Act.
      await target.write(file);
      await target.write(file, { buffer: Buffer.from(contents) });
      const buffer = await readFile(file);
      const actual = buffer.toString();

      // Assert.
      await expect(unlink(file)).resolves.toBeUndefined();
      expect(actual).toEqual(contents);
    });

    it("should write the file and create the directory if it does not exist", async () => {
      // Arrange.
      const name = `${createGuid()}.json`;
      const folder = resolve(assets, createGuid());
      const file = resolve(folder, createGuid(), name);
      const target = createTestTarget();

      // Act.
      await target.write(file);

      // Assert.
      await expect(unlink(file)).resolves.toBeUndefined();
      await expect(rm(folder, { recursive: true })).resolves.toBeUndefined();
    });
  });
});
