import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { resolvePathLike } from "./resolve-path-like.js";

describe("Path Like to String", () => {
  it("returns the resolution of the string when the path is already a string", () => {
    // Arrange.
    const target = join("tmp", "test.txt");
    const expected = resolve(target);

    // Act.
    const actual = resolvePathLike(target);

    // Assert.
    expect(actual).toEqual(expected);
  });

  it("converts a buffer path into a string", () => {
    // Arrange.
    const target = join("tmp", "buffer.txt");
    const buffer = Buffer.from(target);
    const expected = resolve(target);

    // Act.
    const actual = resolvePathLike(buffer);

    // Assert.
    expect(actual).toEqual(expected);
  });

  it("converts a file URL into a native file system path", () => {
    // Arrange.
    const target = join("tmp", "url.txt");
    const url = pathToFileURL(target);
    const expected = resolve(".", target);

    // Act.
    const actual = resolvePathLike(url);

    // Assert.
    expect(actual).toEqual(expected);
  });
});
