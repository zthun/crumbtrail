import { ZLoggerConsole } from "@zthun/lumberjacky-log";
import { ZCrumbtrailApp } from "./app/app.mjs";

const logger = new ZLoggerConsole(console);
new ZCrumbtrailApp(logger).run().then((result) => (process.exitCode = result));
