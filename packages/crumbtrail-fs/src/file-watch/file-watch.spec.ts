import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

import { createGuid } from "@zthun/helpful-fn";
import type { Subscription } from "rxjs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ZFileSystemNodeType } from "../file-system/file-system-node.mjs";
import { sleepWatchDelay } from "../sleep-watch-delay/sleep-watch-delay.mjs";
import { ZStreamFile } from "../stream/stream-file.mjs";
import { ZFileWatch } from "./file-watch.mjs";

describe("ZFileWatch", () => {
  const assets = resolve(__dirname, "../../.test.file-watch");
  const writer = new ZStreamFile();
  const _subscriptions: Subscription[] = [];
  let _target: ZFileWatch;

  const createTestTarget = async (path: string = assets) => {
    _target = new ZFileWatch(path);

    await _target.start();

    return _target;
  };

  afterEach(async () => {
    _subscriptions.forEach((s) => s.unsubscribe());
    _subscriptions.length = 0;

    await _target.stop();

    await rm(assets, { recursive: true, force: true });
  });

  describe("Add", () => {
    it("should stream the absolute path of a new file when a file is created", async () => {
      // Arrange.
      const file = resolve(assets, `${createGuid()}.json`);
      const onAdd = vi.fn();
      await mkdir(assets, { recursive: true });
      const target = await createTestTarget();
      _subscriptions.push(target.add().subscribe(onAdd));

      // Act.
      await writer.write(file, { buffer: Buffer.from("Contents") });
      await sleepWatchDelay();

      // Assert.
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({ path: file, type: ZFileSystemNodeType.File }),
      );
    });

    // This is here for potential future cases.
    // Not all OS's report folders, only MacOS
    // does consistently
    it.todo(
      "should stream the absolute path when a new folder is created",
      async () => {
        // Arrange.
        const folder = resolve(assets, `${createGuid()}.json`);
        const onAdd = vi.fn();
        await mkdir(assets, { recursive: true });
        const target = await createTestTarget();
        _subscriptions.push(target.add().subscribe(onAdd));

        // Act.
        await mkdir(folder);
        await sleepWatchDelay();

        // Assert.
        expect(onAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            path: folder,
            type: ZFileSystemNodeType.Folder,
          }),
        );
      },
    );
  });

  describe("Update", () => {
    it("should stream the absolute path of a file when its contents change", async () => {
      // Arrange.
      const onUpdate = vi.fn();
      const file = resolve(assets, `${createGuid()}.json`);
      await writer.write(file, { buffer: Buffer.from("Old") });
      const target = await createTestTarget();
      _subscriptions.push(target.update().subscribe(onUpdate));

      // Act.
      await writer.write(file, { buffer: Buffer.from("New") });
      await sleepWatchDelay();

      // Assert.
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ path: file, type: ZFileSystemNodeType.File }),
      );
    });

    it("should stream the absolute path of the given path if the path itself changes", async () => {
      // Arrange.
      const onUpdate = vi.fn();
      const file = resolve(assets, `${createGuid()}.json`);
      await writer.write(file, { buffer: Buffer.from("Old") });
      const target = await createTestTarget(file);
      _subscriptions.push(target.update().subscribe(onUpdate));

      // Act.
      await writer.write(file, { buffer: Buffer.from("New") });
      await sleepWatchDelay();

      // Assert.
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ path: file, type: ZFileSystemNodeType.File }),
      );
    });
  });

  describe("Remove", () => {
    it("should stream the absolute path of a file when it is removed", async () => {
      // Arrange.
      const onRemove = vi.fn();
      const file = resolve(assets, `${createGuid()}.json`);
      await writer.write(file);
      const target = await createTestTarget();
      _subscriptions.push(target.remove().subscribe(onRemove));

      // Act.
      await rm(file);
      await sleepWatchDelay();

      // Assert.
      expect(onRemove).toHaveBeenCalledWith(
        expect.objectContaining({ path: file }),
      );
    });

    // This is here for potential future cases.
    // Not all OS's report folders, only MacOS
    // does consistently
    it.todo(
      "should stream the absolute path of a folder when it is removed",
      async () => {
        // Arrange.
        const onRemove = vi.fn();
        const folder = resolve(assets, `${createGuid()}`);
        await mkdir(folder, { recursive: true });
        const target = await createTestTarget();
        _subscriptions.push(target.remove().subscribe(onRemove));

        // Act.
        await rm(folder, { recursive: true, force: true });
        await sleepWatchDelay();

        // Assert.
        expect(onRemove).toHaveBeenCalledWith(
          expect.objectContaining({ path: folder }),
        );
      },
    );

    it("should stream the absolute path of the give path if the path itself is removed", async () => {
      // Arrange.
      const onRemove = vi.fn();
      const file = resolve(assets, `${createGuid()}.json`);
      await writer.write(file);
      const target = await createTestTarget(file);
      _subscriptions.push(target.remove().subscribe(onRemove));

      // Act.
      await rm(file);
      await sleepWatchDelay();

      // Assert.
      expect(onRemove).toHaveBeenCalledWith(
        expect.objectContaining({ path: file }),
      );
    });
  });
});
