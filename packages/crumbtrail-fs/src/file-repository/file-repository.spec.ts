import { createGuid, sleep } from "@zthun/helpful-fn";
import { ZDataRequestBuilder } from "@zthun/helpful-query";
import { find } from "lodash-es";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { ZStreamFile } from "../stream/stream-file.mjs";
import { ZStreamFolder } from "../stream/stream-folder.mjs";
import { ZFileRepository } from "./file-repository.mjs";

describe.sequential("ZFileSystemRepository", () => {
  const assets = resolve(__dirname, "../../.test.file-system-repository");
  const fileWriter = new ZStreamFile();
  const folderWriter = new ZStreamFolder();
  const json = resolve(assets, `${createGuid()}.json`);
  const xml = resolve(assets, `${createGuid()}.xml`);
  const txt = resolve(assets, createGuid(), `${createGuid()}.txt`);
  const files = [json, xml, txt];

  let _target: ZFileRepository | undefined;

  const createTestTarget = async (globs?: string[]) => {
    _target = new ZFileRepository();
    await folderWriter.write(assets);
    await _target.setRoot(assets, globs);
    return _target;
  };

  beforeEach(async () => {
    await rm(assets, { recursive: true, force: true });
  });

  afterEach(async () => {
    await _target?.reset();
  });

  afterAll(async () => {
    await rm(assets, { recursive: true, force: true });
  });

  describe.sequential("Initial Scan", () => {
    beforeEach(async () => {
      await fileWriter.write(json);
      await fileWriter.write(xml);
      await fileWriter.write(txt);
    });

    it("should find all files in the given path", async () => {
      // Arrange.
      const target = await createTestTarget();

      // Act.
      const actual = await target.retrieve(new ZDataRequestBuilder().build());

      // Assert.
      expect(find(actual, (f) => f.path === json)).toBeTruthy();
      expect(find(actual, (f) => f.path === xml)).toBeTruthy();
      expect(find(actual, (f) => f.path === txt)).toBeTruthy();
    });

    it("should only find files in the given glob scopes", async () => {
      // Arrange.
      const target = await createTestTarget(["**/*.xml"]);

      // Act.
      const actual = await target.retrieve(new ZDataRequestBuilder().build());

      // Assert.
      expect(find(actual, (f) => f.path === json)).toBeFalsy();
      expect(find(actual, (f) => f.path === xml)).toBeTruthy();
      expect(find(actual, (f) => f.path === txt)).toBeFalsy();
    });

    it("should not list directories", async () => {
      // Arrange.
      const target = await createTestTarget();

      // Act.
      const actual = await target.count(new ZDataRequestBuilder().build());

      // Assert.
      expect(actual).toEqual(files.length);
    });
  });

  describe.sequential("Mutations", () => {
    const delay = 1500;

    it("should add a file to the repository when a new file is created", async () => {
      // Arrange.
      const target = await createTestTarget();

      // Act.
      await fileWriter.write(txt, { buffer: Buffer.from("New File") });
      await sleep(delay);
      const actual = await target.retrieve(new ZDataRequestBuilder().build());

      // Assert.
      expect(find(actual, (f) => f.path === txt)).toBeTruthy();
    });

    it("should not add directories", async () => {
      // Arrange.
      const folder = resolve(assets, createGuid());
      const target = await createTestTarget();

      // Act.
      await folderWriter.write(folder);
      await sleep(delay);
      const actual = await target.retrieve(new ZDataRequestBuilder().build());

      // Assert.
      expect(find(actual, (f) => f.path === folder)).toBeFalsy();
    });

    it("should only add files that match the glob patterns", async () => {
      // Arrange.
      const target = await createTestTarget(["**/*.txt"]);

      // Act.
      await fileWriter.write(json);
      await fileWriter.write(xml);
      await fileWriter.write(txt);
      await sleep(delay);
      const actual = await target.retrieve(new ZDataRequestBuilder().build());

      // Assert.
      expect(find(actual, (f) => f.path === json)).toBeFalsy();
      expect(find(actual, (f) => f.path === xml)).toBeFalsy();
      expect(find(actual, (f) => f.path === txt)).toBeTruthy();
    });

    it("should remove a file from the repository when a file is unlinked", async () => {
      // Arrange.
      await fileWriter.write(txt);
      const target = await createTestTarget();

      // Act.
      await rm(txt);
      await sleep(delay);
      const actual = await target.count(new ZDataRequestBuilder().build());

      // Assert.
      expect(actual).toEqual(0);
    });

    it("should remove all files from the repository when a parent folder is unlinked", async () => {
      // Arrange.
      await fileWriter.write(json);
      await fileWriter.write(xml);
      await fileWriter.write(txt);
      const target = await createTestTarget();

      // Act.
      await rm(assets, { recursive: true, force: true });
      await sleep(delay);
      const actual = await target.count(new ZDataRequestBuilder().build());

      // Assert.
      expect(actual).toEqual(0);
    });
  });

  describe.sequential("Get", () => {
    beforeEach(async () => {
      await fileWriter.write(json);
      await fileWriter.write(xml);
    });

    it("should return the node that matches the path", async () => {
      // Arrange.
      const target = await createTestTarget();

      // Act.
      const actual = await target.get(json);

      // Assert.
      expect(actual?.path).toEqual(json);
    });

    it("should return null if no such file exists", async () => {
      // Arrange.
      const target = await createTestTarget();

      // Act.
      const actual = await target.get(txt);

      // Assert.
      expect(actual).toBeNull();
    });
  });
});
