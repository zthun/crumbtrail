import { ZLoggerSilent } from "@zthun/lumberjacky-log";
import { resolve } from "node:path";
import { cwd } from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ZCrumbtrailApp } from "./app.mjs";

describe("ZCrumbtrailApp", () => {
  const directory = resolve(__dirname, ".test.cli");

  const logger = new ZLoggerSilent();
  let _target: ZCrumbtrailApp | undefined;

  beforeEach(() => {
    vi.spyOn(logger, "log");
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
      const actual = await target.watching();

      // Assert.
      expect(actual).toBeFalsy();
    });
  });
});
