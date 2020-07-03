/**
 * Specification for a file system.
 */
export interface FileSystem {
  /**
   * Read a dir and list its files.
   * @param path the dir path
   */
  listFiles(path: string): Promise<string[]>;

  /**
   * Read a file.
   * @param path the file path
   */
  readFile(path: string): Promise<Buffer>;
}
