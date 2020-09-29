import Http from "@lib/http/Http";
import { GITHUB_URL } from "@lib/static";
import { container } from "tsyringe";
import "../AppContainer";
import GithubUser from "./GithubUser";
import User from "./User";

const http: Http = container.resolve("Http");

export async function getUser(): Promise<User> {
  const user: GithubUser = await http.execute<GithubUser>(GITHUB_URL);

  return {
    avatar: user.avatar_url,
    username: user.login,
  };
}
