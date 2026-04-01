import { resolve, sep } from "node:path";

import { firstDefined, sleep } from "@zthun/helpful-fn";
import type { IZDataRequest, IZDataSource } from "@zthun/helpful-query";
import { ZDataSourceStatic } from "@zthun/helpful-query";
import { find, findIndex, flatten, trimEnd, uniqBy } from "lodash-es";
import { minimatch } from "minimatch";
import type { Subscription } from "rxjs";

import {
  type IZFileSystemNode,
  ZFileSystemNodeType,
} from "../file-system/file-system-node.mjs";
import {
  type IZFileSystemService,
  ZFileSystemService,
} from "../file-system/file-system-service.mjs";
import { type IZFileWatch, ZFileWatch } from "../file-watch/file-watch.mjs";

/**
 * Represents a repository for the file system.
 */
export interface IZFileRepository extends IZDataSource<IZFileSystemNode> {
  /**
   * Retrieves a single file from the repository.
   *
   * @param path -
   *        The fully qualified path to the file.
   *
   * @returns
   *        The node that represents the file. Returns null if no
   *        such file exists.
   */
  get(path: string): Promise<IZFileSystemNode | null>;
}

/**
 * Represents an implementation of a ZFileRepository that watches
 * a given path scope.
 *
 * This repository is only concerned about files.  Folders
 * will not be retrieved from this repository.
 */
export class ZFileRepository implements IZFileRepository {
  private _service: IZFileSystemService = new ZFileSystemService();
  private _watcher: IZFileWatch | undefined;
  private _nodes: Promise<ZDataSourceStatic<IZFileSystemNode>> =
    Promise.resolve(new ZDataSourceStatic<IZFileSystemNode>([]));
  private _globs: string[] = ["**"];
  private _path: string = "";
  private _add: Subscription | undefined;
  private _remove: Subscription | undefined;
  private _update: Subscription | undefined;

  /**
   * Gets the path that this repository is watching.
   */
  public get path() {
    return this._path;
  }

  /**
   * Gets the globs matchers that this repository is matching against.
   */
  public get globs() {
    return this._globs.slice();
  }

  /**
   * Initializes the repository with the given root and glob filter.
   *
   * This will initially scan the file system and setup watches.
   * If you call this method again, then the repository will be
   * {@link reset} and a new set of files will be added to the
   * repository.
   *
   * @param path -
   *        The root path of the repository.
   * @param globs -
   *        The optional relative globs of the repository.  If this is falsy,
   *        then ** is used.  You can achieve the same kind of operation
   *        using filters, but filtering out unwanted files frees up the internal
   *        memory being used.
   */
  public async initialize(path: string, globs: string[] = ["**"]) {
    await this.reset();

    this._path = path;
    this._globs = globs;

    // Note that this all happens in the background and should
    // only be awaited later.  So the search should not be
    // required to finish when existing this method.  The only
    // requirement is that the repository is reset and the path +
    // glob scope is updated.  Everything beyond here should not
    // be awaited - it will be awaited later once the caller
    // tries to retrieve the files using retrieve, get, or
    // count.
    const matches = globs.map((g) =>
      this._service.search(g, {
        cwd: path,
        stat: true,
      }),
    );

    this._nodes = Promise.all(matches)
      .then((nodes) => {
        const flat = flatten(nodes);
        const uniq = uniqBy(flat, (n) => n.path);
        return uniq.filter((n) => n.type === ZFileSystemNodeType.File);
      })
      .then((files) => {
        return new ZDataSourceStatic(files);
      });

    this._watcher = new ZFileWatch(path);

    this._add = this._watcher
      .add()
      .subscribe(async (node: IZFileSystemNode) => {
        if (
          node.type === ZFileSystemNodeType.File &&
          this._globs.some((g) => minimatch(node.path, resolve(this._path, g)))
        ) {
          const nodes = await this._nodes;
          this._nodes = nodes.insert(node);
        }
      });

    this._remove = this._watcher
      .remove()
      .subscribe(async (node: IZFileSystemNode) => {
        let nodes = await this._nodes;
        const path = trimEnd(node.path, sep);

        // It's possible that the node given was a folder.  If that happens,
        // we need to remove all files that start with the given path.
        // If the node does point to a file, then there is no possibility that
        // more than 1 item would be removed.

        const next = async () =>
          findIndex(await nodes.items(), (n) => {
            return (
              n.path === path ||
              (n.path.startsWith(path) &&
                n.path.substring(path.length).charAt(0) === sep)
            );
          });

        for (let index = await next(); index >= 0; index = await next()) {
          nodes = await nodes.removeAt(index);
        }

        this._nodes = Promise.resolve(nodes);
      });

    this._update = this._watcher
      .update()
      .subscribe(async (node: IZFileSystemNode) => {
        const nodes = await this._nodes;
        const index = findIndex(
          await nodes.items(),
          (n) => n.path === node.path,
        );

        // It's possible node was filtered out by the globs, or
        // it is a directory.  If so, then we won't have it in our
        // list.
        if (index >= 0) {
          const next = await nodes.removeAt(index);
          this._nodes = next.insert(node, index);
        }
      });

    // Kick off the initial seed operation with an even loop
    // invocation.
    await sleep(100);

    await this._watcher?.start();
  }

  /**
   * Resets the repository as if it was initially created.
   */
  public async reset(): Promise<void> {
    await this._watcher?.stop();

    this._add?.unsubscribe();
    this._remove?.unsubscribe();
    this._update?.unsubscribe();

    delete this._add;
    delete this._remove;
    delete this._update;
    delete this._watcher;

    this._path = "";
    this._globs = ["**"];
    this._nodes = Promise.resolve(new ZDataSourceStatic<IZFileSystemNode>([]));
  }

  public async get(path: string): Promise<IZFileSystemNode | null> {
    const nodes = await this._nodes;
    const items = await nodes.items();
    const node = find(items, (f) => f.path === path);

    return firstDefined(null, node);
  }

  public async count(request: IZDataRequest): Promise<number> {
    const source = await this._nodes;
    return source.count(request);
  }

  public async retrieve(request: IZDataRequest): Promise<IZFileSystemNode[]> {
    const source = await this._nodes;
    return source.retrieve(request);
  }
}
