import type { Stats } from "node:fs";
import { basename, dirname, extname } from "node:path";

import { type ZMutable } from "@zthun/helpful-fn";
import { isUndefined, omitBy } from "lodash-es";

/**
 * Represents a type of a file system node.
 */
export enum ZFileSystemNodeType {
  File = "file",
  Folder = "folder",
}

export interface IZFileSystemNode {
  /**
   * The absolute path of the node.
   */
  path: string;

  /**
   * The type of the node (file or folder).
   */
  type: ZFileSystemNodeType;

  /**
   * The creation date of the node.
   */
  created?: string;

  /**
   * The modification date of the node.
   */
  updated?: string;

  /**
   * The size of the node in bytes.
   */
  size?: bigint;

  /**
   * The file or folder name with the extension.
   *
   * Calculated from the path.
   */
  readonly name: string;

  /**
   * The file extension.
   *
   * Calculated from the path.
   */
  readonly extension: string;

  /**
   * File title.
   *
   * The name without the extension.
   * Calculated from the path.
   */
  readonly title: string;

  /**
   * Parent directory path.
   */
  readonly parent: string;
}

/**
 * Represents a builder for a file system node.
 */
export class ZFileSystemNodeBuilder {
  private _node: ZMutable<IZFileSystemNode> = {
    path: "/",
    type: ZFileSystemNodeType.Folder,
    extension: "",
    name: "",
    parent: "",
    title: "",
  };

  public created(at?: Date | string) {
    this._node.created = at instanceof Date ? at.toJSON() : at;

    return this;
  }

  public updated(at?: Date | string) {
    this._node.updated = at instanceof Date ? at.toJSON() : at;

    return this;
  }

  public size(bytes: bigint | number | undefined) {
    this._node.size = typeof bytes == "number" ? BigInt(bytes) : bytes;

    return this;
  }

  public path(path: string) {
    this._node.path = path;

    return this.decorate();
  }

  public type(type: ZFileSystemNodeType) {
    this._node.type = type;

    return this.decorate();
  }

  public file = this.type.bind(this, ZFileSystemNodeType.File);
  public folder = this.type.bind(this, ZFileSystemNodeType.Folder);

  public stats(s: Stats) {
    const builder = this.size(s.size).created(s.birthtime).updated(s.mtime);

    return s.isFile() ? builder.file() : builder.folder();
  }

  public build() {
    const clone = structuredClone(this._node);

    return omitBy(clone, isUndefined) as IZFileSystemNode;
  }

  private decorate() {
    const { path, type } = this._node;

    this._node.name = basename(path);
    this._node.extension = "";
    this._node.title = this._node.name;
    this._node.parent = dirname(path);

    if (type === ZFileSystemNodeType.File) {
      const extension = extname(path);
      this._node.extension = extension;
      this._node.title = basename(path, extension);
    }

    if (!path || path === "/" || this._node.parent === ".") {
      this._node.parent = "";
    }

    return this;
  }
}
