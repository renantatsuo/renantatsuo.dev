import fs from "fs/promises";
import { FileSystem } from "./FileSystem";

/**
 * The FileSystem implementation using local fs module.
 */
export class LocalFileSystem implements FileSystem {
  listFiles(path: string): Promise<string[]> {
    return fs.readdir(path);
  }

  readFile(path: string): Promise<Buffer> {
    return fs.readFile(path);
  }
}
