import { createGuid } from "@zthun/helpful-fn";
import { rm, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { ZStreamFolder } from "./stream-folder.mjs";

describe("ZStreamFolder", () => {
  const assets = resolve(__dirname, "../../.test.stream-folder");

  const createTestTarget = () => new ZStreamFolder();

  beforeEach(async () => {
    await rm(assets, { recursive: true, force: true });
  });

  afterAll(async () => {
    await rm(assets, { recursive: true, force: true });
  });

  it("should create the folder if it does not exist", async () => {
    // Arrange.
    const target = createTestTarget();

    // Act.
    await target.write(assets);
    const actual = await stat(assets);

    // Assert.
    expect(actual.isDirectory()).toBeTruthy();
  });

  it("should do nothing if the folder exists", async () => {
    // Arrange.
    const folder = resolve(assets, createGuid());
    const target = createTestTarget();

    // Act.
    await target.write(folder);
    await target.write(folder);
    const actual = await stat(folder);

    // Assert.
    expect(actual.isDirectory()).toBeTruthy();
  });

  it("should return 0", async () => {
    // Arrange.
    const target = createTestTarget();

    // Act.
    const actual = await target.write(assets);

    // Assert.
    expect(actual).toEqual(0);
  });

  it("should throw an error if a file exists at the target location", async () => {
    // Arrange.
    const file = resolve(assets, createGuid());
    const target = createTestTarget();
    await target.write(assets);
    await writeFile(file, Buffer.from("I am file"));

    // Act.
    const actual = target.write(file);

    // Assert.
    await expect(actual).rejects.toBeInstanceOf(Error);
  });
});
