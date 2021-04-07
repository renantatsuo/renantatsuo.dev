import fs from "fs";
import util from "util";
import { FileSystem } from "./FileSystem";

const readDirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);

/**
 * The FileSystem implementation using local fs module.
 */
export class LocalFileSystem implements FileSystem {
  listFiles(path: string): Promise<string[]> {
    return readDirAsync(path);
  }

  readFile(path: string): Promise<Buffer> {
    return readFileAsync(path);
  }
}
