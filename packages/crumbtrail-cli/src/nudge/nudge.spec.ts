import { ZWatchDelay } from "@zthun/crumbtrail-fs";
import { sleep } from "@zthun/helpful-fn";
import glob from "fast-glob";
import { readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IZCrumbtrailNudgeOptions } from "./nudge.mjs";
import { ZCrumbtrailNudge } from "./nudge.mjs";

vi.mock("fast-glob");
vi.mock("node:fs/promises");

describe("ZCrumbtrailNudge", () => {
  const _glob = vi.mocked(glob);
  const _readdir = vi.mocked(readdir);
  let _target: ZCrumbtrailNudge;

  beforeEach(() => {
    _glob.mockResolvedValue([]);
    _readdir.mockResolvedValue([]);

    _glob.mockClear();
    _readdir.mockClear();
  });

  afterEach(async () => {
    await _target.kill();
  });

  const createTestTarget = () => {
    _target = new ZCrumbtrailNudge();
    return _target;
  };

  const createRunTarget = (options: IZCrumbtrailNudgeOptions = {}) => {
    const target = createTestTarget();
    void target.run(options);
    return target;
  };

  it("should nudge the parent directory", async () => {
    // Arrange.
    createRunTarget({ every: 5000 });
    const expected = dirname(process.cwd());

    // Act.
    await sleep(1);

    // Assert
    expect(_readdir).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it("should nudge every target set of seconds", async () => {
    // Arrange.
    const every = 500;
    const directory = resolve(__dirname, "../watch");
    createRunTarget({ directory, every });

    // Act.
    await sleep(every * 2);

    // Assert.
    expect(_readdir.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(_readdir).toHaveBeenCalledWith(dirname(directory));
  });

  it("should nudge every subdirectory", async () => {
    // Arrange.
    const directory = process.cwd();
    const target = createRunTarget({ recursive: true });
    const expected = `${directory}/**`;

    // Act.
    await sleep(ZWatchDelay);
    await target.kill();

    // Assert.
    expect(_glob).toHaveBeenCalledWith(expected, { onlyDirectories: true });
  });
});
