# @zthun/crumbtrail-cli

Crumbtrail CLI provides command-line utilities for debugging file system
changes. It can watch a directory and log additions, removals, and updates, or
repeatedly refresh directory listings to help file changes become visible in
container-mounted directories.

## Installation

Requires Node.js 24.13.0 or later.

```sh
npm install -g @zthun/crumbtrail-cli
```

## Usage

### Watch a directory

`watch` is the default command. Without a directory option, it watches the
current working directory.

```sh
crumbtrail-cli
crumbtrail-cli watch --directory /path/to/directory
```

Use `-d` as a shorter form of `--directory`. Press Ctrl+C to stop watching.

### Refresh directory listings

The `nudge` command repeatedly reads the target directory's parent directory.
This can help refresh file change visibility in Docker mounts on non-Linux
hosts. It refreshes listings rather than modifying directory timestamps.

```sh
crumbtrail-cli nudge --directory /path/to/directory
crumbtrail-cli nudge --directory /path/to/directory --recursive --every 2000 --silent
```

| Option                   | Description                                  | Default                   |
| ------------------------ | -------------------------------------------- | ------------------------- |
| `-d, --directory <path>` | Directory to refresh.                        | Current working directory |
| `--recursive`            | Also scan subdirectories.                    | Disabled                  |
| `-e, --every <ms>`       | Interval between refreshes, in milliseconds. | `1500`                    |
| `--silent`               | Suppress log output.                         | Disabled                  |

Press Ctrl+C to stop nudging. Recursive scans can increase CPU usage in large
directory trees.

Use `crumbtrail-cli --help`, `crumbtrail-cli watch --help`, or
`crumbtrail-cli nudge --help` to list commands and options.
