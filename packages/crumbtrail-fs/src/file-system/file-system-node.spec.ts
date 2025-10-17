import type { Stats } from "node:fs";
import { stat } from "node:fs/promises";
import { beforeEach, describe, expect, it } from "vitest";
import {
  ZFileSystemNodeBuilder,
  ZFileSystemNodeType,
} from "./file-system-node.mjs";

describe("ZFileSystemNode", () => {
  const now = new Date();
  const createTestTarget = () => new ZFileSystemNodeBuilder();

  describe("Created", () => {
    it("should set the value (Date)", () => {
      expect(createTestTarget().created(now).build().created).toEqual(
        now.toJSON(),
      );
    });

    it("should set the value (string)", () => {
      expect(createTestTarget().created(now.toJSON()).build().created).toEqual(
        now.toJSON(),
      );
    });

    it("should remove the value", () => {
      expect(
        createTestTarget().created(now).created(undefined).build().created,
      ).toBeUndefined();
    });
  });

  describe("Updated", () => {
    it("should set the value (Date)", () => {
      expect(createTestTarget().updated(now).build().updated).toEqual(
        now.toJSON(),
      );
    });

    it("should set the value (string)", () => {
      expect(createTestTarget().updated(now.toJSON()).build().updated).toEqual(
        now.toJSON(),
      );
    });

    it("should remove the value", () => {
      expect(
        createTestTarget().updated(now).updated(undefined).build().created,
      ).toBeUndefined();
    });
  });

  describe("Path", () => {
    it("should set the value", () => {
      const expected = "/path/to/node";
      expect(createTestTarget().path(expected).build().path).toEqual(expected);
    });
  });

  describe("Size", () => {
    it("should set the value (BigInt)", () => {
      const expected = BigInt(250);
      expect(createTestTarget().size(expected).build().size).toEqual(expected);
    });

    it("should set the value (number)", () => {
      const expected = BigInt(250);
      expect(createTestTarget().size(250).build().size).toEqual(expected);
    });

    it("should remove the value", () => {
      expect(
        createTestTarget().size(250).size(undefined).build().size,
      ).toBeUndefined();
    });
  });

  describe("Type", () => {
    it("should be a folder", () => {
      expect(createTestTarget().file().folder().build().type).toEqual(
        ZFileSystemNodeType.Folder,
      );
    });

    it("should be a file", () => {
      expect(createTestTarget().folder().file().build().type).toEqual(
        ZFileSystemNodeType.File,
      );
    });
  });

  describe("Stats", () => {
    let file: Stats;
    let folder: Stats;

    beforeEach(async () => {
      file = await stat(__filename);
      folder = await stat(__dirname);
    });

    describe("File", () => {
      it("should set the file size", () => {
        expect(createTestTarget().stats(file).build().size).toEqual(
          BigInt(file.size),
        );
      });

      it("should set the created date", () => {
        expect(createTestTarget().stats(file).build().created).toEqual(
          file.birthtime.toJSON(),
        );
      });

      it("should set the updated date", () => {
        expect(createTestTarget().stats(file).build().updated).toEqual(
          file.mtime.toJSON(),
        );
      });

      it("should set the type to file", () => {
        expect(createTestTarget().stats(file).build().type).toEqual(
          ZFileSystemNodeType.File,
        );
      });
    });

    describe("Folder", () => {
      it("should set the file size", () => {
        expect(createTestTarget().stats(folder).build().size).toEqual(
          BigInt(folder.size),
        );
      });

      it("should set the created date", () => {
        expect(createTestTarget().stats(folder).build().created).toEqual(
          folder.birthtime.toJSON(),
        );
      });

      it("should set the updated date", () => {
        expect(createTestTarget().stats(folder).build().updated).toEqual(
          folder.mtime.toJSON(),
        );
      });

      it("should set the type to folder", () => {
        expect(createTestTarget().stats(folder).build().type).toEqual(
          ZFileSystemNodeType.Folder,
        );
      });
    });
  });
});
