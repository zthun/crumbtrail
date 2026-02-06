import { ZLoggerConsole } from "@zthun/lumberjacky-log";
import { Command } from "commander";
import type { IZCrumbtrailNudgeOptions } from "./nudge/nudge.mjs";
import { ZCrumbtrailNudge } from "./nudge/nudge.mjs";
import type { IZCrumbtrailWatchOptions } from "./watch/watch.mjs";
import { ZCrumbtrailWatch } from "./watch/watch.mjs";

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
    (val, prev) => prev.concat(val),
    ["**"],
  )
  .action(async (options: IZCrumbtrailWatchOptions) => {
    const command = new ZCrumbtrailWatch(logger);
    const result = await command.run(options);
    process.exitCode = result;
  });

application
  .command("nudge")
  .description("Touch directory timestamps to prompt a refresh")
  .option("-d, --directory <path>", "Directory to refresh", process.cwd())
  .option("-r, --recursive", "Nudge all subdirectories as well", false)
  .option("-e, --every <ms>", "Time between nudges in milliseconds", parseInt)
  .action(async (options: IZCrumbtrailNudgeOptions) => {
    const command = new ZCrumbtrailNudge();
    process.exitCode = await command.run(options);
  });

application.parse();
