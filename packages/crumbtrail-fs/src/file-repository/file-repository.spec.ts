import { createGuid } from "@zthun/helpful-fn";
import { ZDataRequestBuilder } from "@zthun/helpful-query";
import { find } from "lodash-es";
import { rename, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { sleepWatchDelay } from "../sleep-watch-delay/sleep-watch-delay.mjs";
import { ZStreamFile } from "../stream/stream-file.mjs";
import { ZStreamFolder } from "../stream/stream-folder.mjs";
import { ZFileRepository } from "./file-repository.mjs";

describe("ZFileSystemRepository", () => {
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
    await _target.initialize(assets, globs);
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

  describe("Initial Scan", () => {
    beforeEach(async () => {
      await fileWriter.write(json);
      await fileWriter.write(xml);
      await fileWriter.write(txt);
    });

    it("should shut down immediately", async () => {
      // Arrange.
      const target = await createTestTarget();

      // Act.
      await target.reset();
      const actual = await target.count(new ZDataRequestBuilder().build());

      // Assert.
      expect(actual).toEqual(0);
    });

    it("should find all files in the given path", async () => {
      // Arrange.
      const target = await createTestTarget();

      // Act.
      const actual = await target.retrieve(new ZDataRequestBuilder().build());

      // Assert.
      expect(target.path).toEqual(assets);
      expect(find(actual, (f) => f.path === json)).toBeTruthy();
      expect(find(actual, (f) => f.path === xml)).toBeTruthy();
      expect(find(actual, (f) => f.path === txt)).toBeTruthy();
    });

    it("should only find files in the given glob scopes", async () => {
      // Arrange.
      const globs = ["**/*.xml"];
      const target = await createTestTarget(globs);

      // Act.
      const actual = await target.retrieve(new ZDataRequestBuilder().build());

      // Assert.
      expect(target.globs).toEqual(globs);
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

  describe("Mutations", () => {
    describe("Add", () => {
      it("should add a file to the repository when a new file is created", async () => {
        // Arrange.
        const target = await createTestTarget();

        // Act.
        await fileWriter.write(txt, { buffer: Buffer.from("New File") });
        await sleepWatchDelay();
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
        await sleepWatchDelay();
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
        await sleepWatchDelay();
        const actual = await target.retrieve(new ZDataRequestBuilder().build());

        // Assert.
        expect(find(actual, (f) => f.path === json)).toBeFalsy();
        expect(find(actual, (f) => f.path === xml)).toBeFalsy();
        expect(find(actual, (f) => f.path === txt)).toBeTruthy();
      });
    });

    describe("Remove", () => {
      it("should remove a file from the repository when a file is unlinked", async () => {
        // Arrange.
        await fileWriter.write(txt);
        const target = await createTestTarget();

        // Act.
        await rm(txt);
        await sleepWatchDelay();
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
        await sleepWatchDelay();
        const actual = await target.count(new ZDataRequestBuilder().build());

        // Assert.
        expect(actual).toEqual(0);
      });

      it("should remove only the files found inside a parent folder and not ones named very similar", async () => {
        // Arrange.
        const dir = resolve(assets, "foo");
        const foo = resolve(dir, "foo.txt");
        const foobar = resolve(assets, "foobar", "bar.txt");
        await fileWriter.write(foo);
        await fileWriter.write(foobar);
        const target = await createTestTarget();

        // Act.
        await rm(dir, { recursive: true, force: true });
        await sleepWatchDelay();
        const actual = await target.retrieve(new ZDataRequestBuilder().build());

        // Assert.
        expect(actual.length).toEqual(1);
        expect(find(actual, (f) => f.path === foobar)).toBeTruthy();
      });
    });

    describe("Update", () => {
      it("should replace the node with a node that has updated its stats", async () => {
        // Arrange.
        await fileWriter.write(json);
        const target = await createTestTarget();
        const buffer = Buffer.from("Updated file content");

        // Act.
        await fileWriter.write(json, { buffer });
        const { size } = await stat(json);
        const expected = BigInt(size);
        await sleepWatchDelay();
        const actual = await target.get(json);

        // Assert.
        expect(actual?.size).toEqual(expected);
      });

      it("should not replace any node if the node was filtered out", async () => {
        // Arrange.
        await fileWriter.write(json);
        await fileWriter.write(xml);
        const target = await createTestTarget([".xml"]);

        // Act.
        await fileWriter.write(json, { buffer: Buffer.from("Nope") });
        await sleepWatchDelay();
        const actual = await target.get(json);

        // Assert.
        expect(actual).toBeNull();
      });

      it("should replace the node with a node that was renamed", async () => {
        // Arrange.
        await fileWriter.write(json);
        const target = await createTestTarget();

        // Act.
        await rename(json, xml);
        await sleepWatchDelay();
        const _json = await target.get(json);
        const _xml = await target.get(xml);

        // Assert.
        expect(_json).toBeNull();
        expect(_xml).toBeTruthy();
      });
    });
  });

  describe("Get", () => {
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
