import {
  sleepWatchDelay,
  ZStreamFile,
  ZStreamFolder,
} from "@zthun/crumbtrail-fs";
import type { IZLogger } from "@zthun/lumberjacky-log";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { cwd } from "node:process";
import type { Mocked } from "vitest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { ZCrumbtrailApp } from "./app.mjs";

describe("ZCrumbtrailApp", () => {
  const directory = resolve(__dirname, ".test.cli");

  let logger: Mocked<IZLogger>;
  let _target: ZCrumbtrailApp | undefined;

  beforeEach(() => {
    logger = mock<IZLogger>();
  });

  afterEach(async () => {
    await _target?.kill();
  });

  const createTestTarget = () => {
    _target = new ZCrumbtrailApp(logger);
    return _target;
  };

  describe("Initial", () => {
    it("should not be watching any directory", async () => {
      // Arrange.
      const target = createTestTarget();

      // Act.
      const actual = await target.watching();

      // Assert.
      expect(actual).toBeUndefined();
    });

    it("should not have any configured globs", async () => {
      // Arrange.
      const target = createTestTarget();

      // Act.
      const actual = await target.globs();

      // Assert.
      expect(actual).toBeUndefined();
    });
  });

  describe("Run", () => {
    describe("Without arguments", () => {
      it("should watch the current working directory if the directory argument is not set", async () => {
        // Arrange.
        const target = createTestTarget();
        const expected = cwd();

        // Act.
        void target.run();
        const actual = await target.watching();

        // Assert.
        expect(actual).toEqual(expected);
      });

      it("should watch all files if the globs argument is not set", async () => {
        // Arrange.
        const target = createTestTarget();
        const expected = ["**"];

        // Act.
        void target.run();
        const actual = await target.globs();

        // Assert.
        expect(actual).toEqual(expected);
      });
    });

    describe("With arguments", () => {
      it("should watch the specified directory", async () => {
        // Arrange.
        const target = createTestTarget();

        // Act.
        void target.run({ directory });
        const actual = await target.watching();

        // Assert.
        expect(actual).toEqual(directory);
      });

      it("should watch the specified directory with the given glob patterns", async () => {
        // Arrange.
        const globs = ["*.mp3", "**/*.m4a"];
        const target = createTestTarget();

        // Act.
        void target.run({ directory, globs });
        const actual = await target.globs();

        // Assert.
        expect(actual).toEqual(globs);
      });
    });
  });

  describe("Kill", () => {
    it("should stop the application", async () => {
      // Arrange.
      const target = createTestTarget();

      // Act.
      void target.run();
      await target.kill();
      const actual = [await target.watching(), await target.globs()];

      // Assert.
      expect(actual.some(Boolean)).toBeFalsy();
    });
  });

  describe.sequential("IO", () => {
    const file = new ZStreamFile();
    const folder = new ZStreamFolder();

    const createReadyTarget = async (globs?: string[]) => {
      const target = createTestTarget();
      void target.run({ directory, globs });
      await target.ready();
      logger.log.mockClear();
      return target;
    };

    beforeEach(async () => {
      await folder.write(directory);
    });

    afterEach(async () => {
      await rm(directory, { force: true, recursive: true });
    });

    describe.sequential("Add", () => {
      it("should log that a file was added", async () => {
        // Arrange.
        const path = resolve(directory, "sample.js");
        const expected = ZCrumbtrailApp.add(path);
        await createReadyTarget();

        // Act.
        await file.write(path);
        await sleepWatchDelay();

        // Assert.
        expect(logger.log).toHaveBeenCalledWith(
          expect.objectContaining({
            level: expected.level,
            message: expected.message,
          }),
        );
      });

      it("should not log anything if the file does not match the glob pattern", async () => {
        // Arrange.
        const path = resolve(directory, "sample.js");
        await createReadyTarget(["*.ts"]);

        // Act.
        await file.write(path);
        await sleepWatchDelay();

        // Assert.
        expect(logger.log).not.toHaveBeenCalled();
      });
    });

    describe.sequential("Remove", () => {
      it("should log that a file was removed", async () => {
        // Arrange.
        const path = resolve(directory, "sample.js");
        await file.write(path);
        const expected = ZCrumbtrailApp.remove(path);
        await createReadyTarget([]);

        // Act.
        await rm(path, { force: true });
        await sleepWatchDelay();

        // Assert.
        expect(logger.log).toHaveBeenCalledWith(
          expect.objectContaining({
            level: expected.level,
            message: expected.message,
          }),
        );
      });

      it("should not log anything if the file does not match the glob pattern", async () => {
        // Arrange.
        const path = resolve(directory, "sample.js");
        await file.write(path);
        await createReadyTarget(["*.ts"]);

        // Act.
        await rm(path, { force: true });
        await sleepWatchDelay();

        // Assert.
        expect(logger.log).not.toHaveBeenCalled();
      });
    });

    describe.sequential("Update", () => {
      it("should log that a file was updated", async () => {
        // Arrange.
        const path = resolve(directory, "sample.js");
        await file.write(path);
        const expected = ZCrumbtrailApp.update(path);
        await createReadyTarget();

        // Act.
        await file.write(path, { buffer: Buffer.from("I am update") });
        await sleepWatchDelay();

        // Assert.
        expect(logger.log).toHaveBeenCalledWith(
          expect.objectContaining({
            level: expected.level,
            message: expected.message,
          }),
        );
      });

      it("should not log anything if the file does not match the glob pattern", async () => {
        // Arrange.
        const path = resolve(directory, "sample.js");
        await file.write(path);
        await createReadyTarget(["*.ts"]);

        // Act.
        await file.write(path, { buffer: Buffer.from("I am update") });
        await sleepWatchDelay();

        // Assert.
        expect(logger.log).not.toHaveBeenCalled();
      });
    });
  });
});
