import { container } from "tsyringe";
import { LocalFileSystem } from "./filesystem/LocalFileSystem";

/**
 * Define dependency injection impls.
 */
container.register("FileSystem", {
  useClass: LocalFileSystem,
});
