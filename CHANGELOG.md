# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.1](https://github.com/zthun/crumbtrail/compare/v3.0.0...v3.0.1) (2026-08-25)

### Bug Fixes

- crumbtrail cli should now properly externalize dependencies ([b7874c8](https://github.com/zthun/crumbtrail/commit/b7874c8185b0d23f1e4bf675439ea3dd8d483156))

# [3.0.0](https://github.com/zthun/crumbtrail/compare/v2.4.12...v3.0.0) (2026-08-25)

### Code Refactoring

- cli only ([e84043d](https://github.com/zthun/crumbtrail/commit/e84043d2bcaca2a7508fbeac09c9377118c59616))
- move internals ([06926cb](https://github.com/zthun/crumbtrail/commit/06926cb6fe97e487582176ec64067eb4a6e17ef1))

### Features

- nudge and watch jobs from cli have been moved into crumbtrail-fs ([251906b](https://github.com/zthun/crumbtrail/commit/251906b0f9e2f7c69875e2145a33cb08b4acb51a))

### BREAKING CHANGES

- Crumbtrail cli no longer exports its internal api
- crumbtrail-cli's nudge and watch jobs have been moved down to crumbtrail-fs

## [2.4.12](https://github.com/zthun/crumbtrail/compare/v2.4.11...v2.4.12) (2026-08-10)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.4.11](https://github.com/zthun/crumbtrail/compare/v2.4.10...v2.4.11) (2026-05-26)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.4.10](https://github.com/zthun/crumbtrail/compare/v2.4.9...v2.4.10) (2026-04-26)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.4.9](https://github.com/zthun/crumbtrail/compare/v2.4.8...v2.4.9) (2026-04-01)

**Note:** Version bump only for package @zthun/crumbtrail

## <small>2.4.8 (2026-02-07)</small>

- chore: spelling ([edf35a7](https://github.com/zthun/crumbtrail/commit/edf35a7))
- chore: update yarn lockfile [skip ci] ([b3dd6de](https://github.com/zthun/crumbtrail/commit/b3dd6de))
- fix: run crumbtrail-cli container not as root ([13f8fed](https://github.com/zthun/crumbtrail/commit/13f8fed))

## <small>2.4.7 (2026-02-07)</small>

- fix: cli node directive ([ea3887f](https://github.com/zthun/crumbtrail/commit/ea3887f))
- build: docker container for crumbtrail cli ([d373cd5](https://github.com/zthun/crumbtrail/commit/d373cd5))
- chore: update yarn lockfile [skip ci] ([b092744](https://github.com/zthun/crumbtrail/commit/b092744))

## <small>2.4.6 (2026-02-07)</small>

- docs: app name ([6e41245](https://github.com/zthun/crumbtrail/commit/6e41245))
- docs: nudge ([7545cd5](https://github.com/zthun/crumbtrail/commit/7545cd5))
- refactor: add logging for file events ([866204e](https://github.com/zthun/crumbtrail/commit/866204e))
- refactor: add logging for nudging ([076ce64](https://github.com/zthun/crumbtrail/commit/076ce64))
- refactor: invoking run twice should return the promise that's already running ([684881d](https://github.com/zthun/crumbtrail/commit/684881d))
- refactor: migrate nudge to crumbtrail cli ([ce7fdbc](https://github.com/zthun/crumbtrail/commit/ce7fdbc))
- refactor: move nudge behavior to encapsulate ([cc69891](https://github.com/zthun/crumbtrail/commit/cc69891))
- refactor: move tsx to crumbtrail-cli ([76c4260](https://github.com/zthun/crumbtrail/commit/76c4260))
- refactor: remove the forced nudge from file watch ([6f5d5e4](https://github.com/zthun/crumbtrail/commit/6f5d5e4))
- refactor: rename app back to crumbtrail cli and use commander ([372ccac](https://github.com/zthun/crumbtrail/commit/372ccac))
- refactor: rename to crumbtrail watch ([80f8056](https://github.com/zthun/crumbtrail/commit/80f8056))
- refactor: shut the logger up if wanted ([a6178b6](https://github.com/zthun/crumbtrail/commit/a6178b6))
- refactor: start glob pattern default at [] ([40633b5](https://github.com/zthun/crumbtrail/commit/40633b5))
- refactor: use an abort controller for watcher nudge stop ([b39a8c1](https://github.com/zthun/crumbtrail/commit/b39a8c1))
- refactor: use text, Node over file (to include folders as well) ([6af11e1](https://github.com/zthun/crumbtrail/commit/6af11e1))
- build: add a docker compose for testing events with cross os file system operations ([be7fbad](https://github.com/zthun/crumbtrail/commit/be7fbad))
- build: add binary launch information ([3263266](https://github.com/zthun/crumbtrail/commit/3263266))
- build: add tsx runner ([a69f33b](https://github.com/zthun/crumbtrail/commit/a69f33b))
- build: build the dockerfile for crumbtrail cli ([8c9f867](https://github.com/zthun/crumbtrail/commit/8c9f867))
- build: dependencies ([9017cf8](https://github.com/zthun/crumbtrail/commit/9017cf8))
- build: launch nudge ([7c5bd95](https://github.com/zthun/crumbtrail/commit/7c5bd95))
- build: update outdated packages ([afe3806](https://github.com/zthun/crumbtrail/commit/afe3806))
- build: watch and nudge together ([47a947c](https://github.com/zthun/crumbtrail/commit/47a947c))
- test: try with empty array for glob listing ([6aaa99f](https://github.com/zthun/crumbtrail/commit/6aaa99f))
- chore: fix dependencies ([352f483](https://github.com/zthun/crumbtrail/commit/352f483))
- chore: spelling ([04218b7](https://github.com/zthun/crumbtrail/commit/04218b7))
- chore: update yarn lockfile [skip ci] ([7db2da1](https://github.com/zthun/crumbtrail/commit/7db2da1))
- fix: running inside a linux container with a non-linux host should now fire add and update events ([4dbcc93](https://github.com/zthun/crumbtrail/commit/4dbcc93))
- feat: crumbtrail-cli adds a command line tool for testing crumbtrail watches ([c4520e5](https://github.com/zthun/crumbtrail/commit/c4520e5))

## <small>2.4.5 (2026-01-31)</small>

- build: update outdated packages ([b55e9b0](https://github.com/zthun/crumbtrail/commit/b55e9b0))
- chore: update yarn lockfile [skip ci] ([e246a09](https://github.com/zthun/crumbtrail/commit/e246a09))

## [2.4.4](https://github.com/zthun/crumbtrail/compare/v2.4.3...v2.4.4) (2026-01-04)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.4.3](https://github.com/zthun/crumbtrail/compare/v2.4.2...v2.4.3) (2026-01-03)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.4.2](https://github.com/zthun/crumbtrail/compare/v2.4.1...v2.4.2) (2025-12-14)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.4.1](https://github.com/zthun/crumbtrail/compare/v2.4.0...v2.4.1) (2025-10-29)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.4.0](https://github.com/zthun/crumbtrail/compare/v2.3.4...v2.4.0) (2025-10-24)

### Features

- added helper properties to the file system node ([80ba17d](https://github.com/zthun/crumbtrail/commit/80ba17d0c0d5703cf04388275b478c136e3c7f6e))

## [2.3.4](https://github.com/zthun/crumbtrail/compare/v2.3.3...v2.3.4) (2025-10-23)

### Bug Fixes

- export stream read ([37ec725](https://github.com/zthun/crumbtrail/commit/37ec725560f7471eb68102139c91c20528f75448))

## [2.3.3](https://github.com/zthun/crumbtrail/compare/v2.3.2...v2.3.3) (2025-10-21)

### Bug Fixes

- destroying a repository during its initial scan no longer crashes the watcher ([632ae95](https://github.com/zthun/crumbtrail/commit/632ae95b9f8a189a18d8f560728c89802e467b9c))

## [2.3.2](https://github.com/zthun/crumbtrail/compare/v2.3.1...v2.3.2) (2025-10-20)

### Bug Fixes

- file system service search does support pattern lists as well ([a51ba30](https://github.com/zthun/crumbtrail/commit/a51ba3031a5fc8b624ab74f86305c423b803a799))

## [2.3.1](https://github.com/zthun/crumbtrail/compare/v2.3.0...v2.3.1) (2025-10-20)

### Bug Fixes

- export sleep watch delay ([c350948](https://github.com/zthun/crumbtrail/commit/c350948ee8ded0a73f97cbabaf0dfa3fceb62ce1))

## [2.3.0](https://github.com/zthun/crumbtrail/compare/v2.2.2...v2.3.0) (2025-10-20)

### Features

- sleep watch delay sleeps for enough time to pick up a watch event ([7d96b7a](https://github.com/zthun/crumbtrail/commit/7d96b7a01b05c2db9cee93fff06b76419109a697))

## [2.2.2](https://github.com/zthun/crumbtrail/compare/v2.2.1...v2.2.2) (2025-10-19)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.2.1](https://github.com/zthun/crumbtrail/compare/v2.2.0...v2.2.1) (2025-10-19)

### Bug Fixes

- path and globs are now public to allow for a recall on what the repository is watching ([eec5421](https://github.com/zthun/crumbtrail/commit/eec54218cb3d323da97df2892de2969e58263457))

## [2.2.0](https://github.com/zthun/crumbtrail/compare/v2.1.4...v2.2.0) (2025-10-19)

### Features

- file repository is currently experimental and not exported yet ([21513ca](https://github.com/zthun/crumbtrail/commit/21513ca063386a2770797e59760c706374cc0a60))
- file system repository can watch for files and folders being added ([abca0e0](https://github.com/zthun/crumbtrail/commit/abca0e0a146c09eba3835b8ff8b4af4a90c27a4c))
- file system repository captures the file system state at a given time ([cb55a23](https://github.com/zthun/crumbtrail/commit/cb55a236d1eee86c484baa48d84d265f6aa5d5ca))
- file watch watches the file system for changes ([2fb9b6a](https://github.com/zthun/crumbtrail/commit/2fb9b6a4834cc06aeb29097c574e9138a9eb5045))
- resolve path like converts a PathLike variable to a string ([656843c](https://github.com/zthun/crumbtrail/commit/656843c68469082bc1abcfe2d7e5978bc67d0efc))
- stream file and stream write help with reading and writing files ([46b917a](https://github.com/zthun/crumbtrail/commit/46b917a5363a64461f95ae8f2ae0c9cc2adafda9))
- stream file can read files as well ([2891cfd](https://github.com/zthun/crumbtrail/commit/2891cfd787f6e600c264609136e887e969af35d8))
- stream file will cache files under a threshold to perform faster reads later on ([171cb30](https://github.com/zthun/crumbtrail/commit/171cb30e1bac9711f5f179bc39a80f59e7c20acf))
- stream folder creates folders on the file system ([eb2ff3b](https://github.com/zthun/crumbtrail/commit/eb2ff3ba9948f26f1a76e1dd847f4b689eb09927))
- you can now set the entire node values from stats ([54a7909](https://github.com/zthun/crumbtrail/commit/54a79098551b65aa44507ab9f9cb18721bddc0d5))

## [2.1.4](https://github.com/zthun/crumbtrail/compare/v2.1.3...v2.1.4) (2025-10-04)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.1.3](https://github.com/zthun/crumbtrail/compare/v2.1.2...v2.1.3) (2025-09-09)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.1.2](https://github.com/zthun/crumbtrail/compare/v2.1.1...v2.1.2) (2025-09-06)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.1.1](https://github.com/zthun/crumbtrail/compare/v2.1.0...v2.1.1) (2025-07-18)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.1.0](https://github.com/zthun/crumbtrail/compare/v2.0.2...v2.1.0) (2025-06-29)

### Features

- you can now do a minimal directory search if all you need is the file names ([2df3390](https://github.com/zthun/crumbtrail/commit/2df33907aec1ff5811bd3ac6bb6c8ac8602639e0))

## [2.0.2](https://github.com/zthun/crumbtrail/compare/v2.0.1...v2.0.2) (2025-06-22)

**Note:** Version bump only for package @zthun/crumbtrail

## [2.0.1](https://github.com/zthun/crumbtrail/compare/v2.0.0...v2.0.1) (2025-06-20)

### ⚠ BREAKING CHANGES

- crumbtrail module strategy is now node next

### Code Refactoring

- crumbtrail module strategy is now node next ([bc31fdb](https://github.com/zthun/crumbtrail/commit/bc31fdbd8faaf29b1dd6c2f3bde5cba0ddccaae4))

## [2.0.0](https://github.com/zthun/crumbtrail/compare/v1.1.0...v2.0.0) (2025-05-30)

### ⚠ BREAKING CHANGES

- walk has been merged into the file system service

### Features

- crumbtrail-nest adds support to import file system services to nest ([7daeb9f](https://github.com/zthun/crumbtrail/commit/7daeb9f1cb04b882118e835344857def8f0d3932))
- walk has been merged into the file system service ([6b602cd](https://github.com/zthun/crumbtrail/commit/6b602cda2ab6bd7909410bfb265bb8cc550bef9e))

## 1.1.0 (2025-05-29)

### Features

- crumbtrail-fs is the successor of helpful-node methods that deal with the file system ([c4f4c02](https://github.com/zthun/crumbtrail/commit/c4f4c020ac702c18b4a828c51ffe8894360e44e2))
- crumbtrail-web is the documentation website for crumbtrail ([49b866b](https://github.com/zthun/crumbtrail/commit/49b866bed0f90548f1428d9d1d92bfb6efe5622d))
