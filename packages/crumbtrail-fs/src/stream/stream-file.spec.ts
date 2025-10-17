import { randomUUID } from "node:crypto";
import { readFile, rm, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ZStreamFile } from "./stream-file.mjs";

describe.sequential("ZStreamWriteFile", () => {
  const assets = resolve(__dirname, "../../assets");

  const createTestTarget = () => new ZStreamFile();

  it("should create the file if not writing any data", async () => {
    // Arrange
    const file = resolve(assets, `${randomUUID()}.json`);
    const target = createTestTarget();

    // Act.
    await target.write(file);

    // Assert.
    await expect(unlink(file)).resolves.toBeUndefined();
  });

  it("should create the file and write the contents", async () => {
    // Arrange.
    const contents = "Should be written to the file";
    const file = resolve(assets, `${randomUUID()}.json`);
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
    const file = resolve(assets, `${randomUUID()}.json`);
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
    const name = `${randomUUID()}.json`;
    const folder = resolve(assets, randomUUID());
    const file = resolve(folder, randomUUID(), name);
    const target = createTestTarget();

    // Act.
    await target.write(file);

    // Assert.
    await expect(unlink(file)).resolves.toBeUndefined();
    await expect(rm(folder, { recursive: true })).resolves.toBeUndefined();
  });
});
