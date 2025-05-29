import { randomUUID } from "node:crypto";
import { basename, dirname } from "path";
import { describe, expect, it } from "vitest";
import { walk } from "./walk.mjs";

const currentFile = basename(__filename);
const assets = "assets";
const testJson = `${assets}/test.json`;

describe("Walk", () => {
  it("should find a path from the given cwd", async () => {
    // Arrange.
    // Act.
    const actual = await walk("node_modules");
    // Assert.
    expect(actual).toMatch("node_modules");
  });

  it("should find a path if the path is __dirname", async () => {
    // Arrange.
    // Act.
    const actual = await walk(__dirname);
    // Assert.
    expect(actual).toMatch(__dirname);
  });

  it("should find a path if the path is __filename", async () => {
    // Arrange.
    // Act.
    const actual = await walk(__filename);
    // Assert.
    expect(actual).toMatch(__filename);
  });

  it("should match the path of the current file", async () => {
    // Arrange.
    // Act
    const actual = await walk(currentFile, { start: __dirname });
    // Assert
    expect(actual).toEqual(__filename);
  });

  it("should return null if no absolute path can be found", async () => {
    // Arrange.
    const path = "/assets";
    // Act.
    const actual = await walk(path);
    // Assert.
    expect(actual).toBeNull();
  });

  it("should return null if no such file exists in the file system", async () => {
    // Arrange.
    const path = randomUUID();
    // Act.
    const actual = await walk(path);
    // Assert
    expect(actual).toBeNull();
  });

  it("should start at the given start directory", async () => {
    // Arrange.
    const start = dirname(__dirname);
    // Act.
    const actual = await walk(currentFile, { start });
    // Assert.
    expect(actual).toBeNull();
  });

  it("should stop at the given stop directory", async () => {
    // Arrange.
    // Act.
    const actual = await walk(testJson, { start: __dirname, stop: __dirname });
    // Assert.
    expect(actual).toBeNull();
  });
});
