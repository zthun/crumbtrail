import { Test } from "@nestjs/testing";
import { ZFileSystemService } from "@zthun/crumbtrail-fs";
import { describe, expect, it } from "vitest";

import { ZFileSystemModule } from "./file-system-module.mjs";
import { ZFileSystemToken } from "./file-system-service.mjs";

describe("File System", () => {
  const createTestTarget = async () => {
    const module = await Test.createTestingModule({
      imports: [ZFileSystemModule],
    }).compile();

    return module;
  };

  it("should return an instance of the file system service", async () => {
    // Arrange.
    const target = await createTestTarget();

    // Act.
    const actual = await target.resolve(ZFileSystemToken);

    // Assert.
    expect(actual).toBeInstanceOf(ZFileSystemService);
  });

  it("should return an instance of the file system service directly", async () => {
    // Arrange.
    const target = await createTestTarget();

    // Act.
    const actual = await target.resolve(ZFileSystemService);

    // Assert.
    expect(actual).toBeInstanceOf(ZFileSystemService);
  });
});
