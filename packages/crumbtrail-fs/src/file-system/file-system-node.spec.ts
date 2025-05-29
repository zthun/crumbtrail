import { describe, expect, it } from "vitest";
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
});
