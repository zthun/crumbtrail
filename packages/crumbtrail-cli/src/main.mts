#!/usr/bin/env node

import type {
  IZCrumbtrailJobNudgeOptions,
  IZCrumbtrailJobWatchOptions,
} from "@zthun/crumbtrail-fs";
import {
  ZCrumbtrailJobNudge,
  ZCrumbtrailJobWatch,
  ZWatchDelay,
} from "@zthun/crumbtrail-fs";
import { ZLoggerConsole, ZLoggerSilent } from "@zthun/lumberjacky-log";
import { Command } from "commander";

const logger = new ZLoggerConsole(console);
const application = new Command();

application
  .name("crumbtrail-cli")
  .description("Crumbtrail utilities for debugging");

application
  .command("watch", { isDefault: true })
  .description("Watch a directory and log changes")
  .option("-d, --directory <dir>", "The directory to watch", process.cwd())
  .option(
    "-g, --glob <pattern>",
    "Glob pattern (repeatable)",
    (val, prev: string[]) => prev.concat(val),
    [],
  )
  .action(async (options: IZCrumbtrailJobWatchOptions) => {
    const command = new ZCrumbtrailJobWatch(logger);
    const result = await command.run(options);
    process.exitCode = result;
  });

application
  .command("nudge")
  .description("Touch directory timestamps to prompt a refresh")
  .option("-d, --directory <path>", "Directory to refresh", process.cwd())
  .option("--recursive", "Nudge all subdirectories as well", false)
  .option("--silent", "Do not log any output.  Nudge silently", false)
  .option(
    "-e, --every <ms>",
    "Time between nudges in milliseconds",
    (v) => Number.parseInt(v, 10),
    ZWatchDelay,
  )
  .action(
    async (options: IZCrumbtrailJobNudgeOptions & { silent: boolean }) => {
      const log = options.silent ? new ZLoggerSilent() : logger;
      const command = new ZCrumbtrailJobNudge(log);
      process.exitCode = await command.run(options);
    },
  );

application.parse();
