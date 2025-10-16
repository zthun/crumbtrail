import { isUndefined, omitBy } from "lodash-es";
import type { Stats } from "node:fs";

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
}

/**
 * Represents a builder for a file system node.
 */
export class ZFileSystemNodeBuilder {
  private _node: IZFileSystemNode;

  public constructor() {
    this._node = {
      path: "/",
      type: ZFileSystemNodeType.Folder,
    };
  }

  public created(at?: Date | string | undefined) {
    this._node.created = at instanceof Date ? at.toJSON() : at;
    return this;
  }

  public updated(at?: Date | string | undefined) {
    this._node.updated = at instanceof Date ? at.toJSON() : at;
    return this;
  }

  public size(bytes: bigint | number | undefined) {
    this._node.size = typeof bytes == "number" ? BigInt(bytes) : bytes;
    return this;
  }

  public path(path: string) {
    this._node.path = path;
    return this;
  }

  public type(type: ZFileSystemNodeType) {
    this._node.type = type;
    return this;
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
}
