import * as Inversify from "inversify";
import { FileSystem } from "./filesystem/FileSystem";
import { LocalFileSystem } from "./filesystem/LocalFileSystem";
import Http from "./http/Http";
import { TypedFetch } from "./http/TypedFetch";
import Posts from "./post/Posts";
import Resume from "./resume/Resume";

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

Inversify.decorate(Inversify.injectable(), Resume);
Inversify.decorate(Inversify.inject("FileSystem"), Resume, 0);

export default AppContainer;
