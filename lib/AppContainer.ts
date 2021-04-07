import * as Inversify from "inversify";
import { FileSystem } from "./filesystem/FileSystem";
import { LocalFileSystem } from "./filesystem/LocalFileSystem";
import Http from "./http/Http";
import { TypedFetch } from "./http/TypedFetch";
import Posts from "./post/Posts";

/**
 * Define dependency injection impls.
 */
const AppContainer = new Inversify.Container();

Inversify.decorate(Inversify.injectable(), TypedFetch);
AppContainer.bind<Http>("Http").to(TypedFetch);

Inversify.decorate(Inversify.injectable(), LocalFileSystem);
AppContainer.bind<FileSystem>("FileSystem")
  .to(LocalFileSystem)
  .inSingletonScope();

Inversify.decorate(Inversify.injectable(), Posts);
Inversify.decorate(Inversify.inject("FileSystem"), Posts, 0);

export default AppContainer;
