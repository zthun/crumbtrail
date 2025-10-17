import { sleep } from "@zthun/helpful-fn";
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import type { Subscription } from "rxjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ZStreamFile } from "../stream/stream-file.mjs";
import { ZFileWatch } from "./file-watch.mjs";

describe.sequential("ZFileWatch", () => {
  const assets = resolve(__dirname, "../../.test.file-watch");
  const writer = new ZStreamFile();
  const delay = 1500;
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

  describe.sequential("Add", () => {
    it("should stream the absolute path of a new file when a file is created", async () => {
      // Arrange.
      const file = resolve(assets, `${randomUUID()}.json`);
      const onAdd = vi.fn();
      await mkdir(assets);
      const target = await createTestTarget();
      _subscriptions.push(target.add().subscribe(onAdd));

      // Act.
      await writer.write(file, Buffer.from("Contents"));
      await sleep(delay);

      // Assert.
      expect(onAdd).toHaveBeenCalledWith(file);
    });
  });

  describe.sequential("Update", () => {
    it("should stream the absolute path of a file when its contents change", async () => {
      // Arrange.
      const onUpdate = vi.fn();
      const file = resolve(assets, `${randomUUID()}.json`);
      await writer.write(file, Buffer.from("Old"));
      const target = await createTestTarget();
      _subscriptions.push(target.update().subscribe(onUpdate));

      // Act.
      await writer.write(file, Buffer.from("New"));
      await sleep(delay);

      // Assert.
      expect(onUpdate).toHaveBeenCalledWith(file);
    });

    it("should stream the absolute path of the given path if the path itself changes", async () => {
      // Arrange.
      const onUpdate = vi.fn();
      const file = resolve(assets, `${randomUUID()}.json`);
      await writer.write(file, Buffer.from("Old"));
      const target = await createTestTarget(file);
      _subscriptions.push(target.update().subscribe(onUpdate));

      // Act.
      await writer.write(file, Buffer.from("New"));
      await sleep(delay);

      // Assert.
      expect(onUpdate).toHaveBeenCalledWith(file);
    });
  });

  describe.sequential("Remove", () => {
    it("should stream the absolute path of a file when it is removed", async () => {
      // Arrange.
      const onRemove = vi.fn();
      const file = resolve(assets, `${randomUUID()}.json`);
      await writer.write(file);
      const target = await createTestTarget();
      _subscriptions.push(target.remove().subscribe(onRemove));

      // Act.
      await rm(file);
      await sleep(delay);

      // Assert.
      expect(onRemove).toHaveBeenCalledWith(file);
    });

    it("should stream the absolute path of the give path if the path itself is removed", async () => {
      // Arrange.
      const onRemove = vi.fn();
      const file = resolve(assets, `${randomUUID()}.json`);
      await writer.write(file);
      const target = await createTestTarget(file);
      _subscriptions.push(target.remove().subscribe(onRemove));

      // Act.
      await rm(file);
      await sleep(delay);

      // Assert.
      expect(onRemove).toHaveBeenCalledWith(file);
    });
  });
});
