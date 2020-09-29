import { container } from "tsyringe";
import { LocalFileSystem } from "./filesystem/LocalFileSystem";
import { TypedFetch } from "./http/TypedFetch";

/**
 * Define dependency injection impls.
 */
container.register("FileSystem", {
  useClass: LocalFileSystem,
});

container.register("Http", {
  useClass: TypedFetch,
});
