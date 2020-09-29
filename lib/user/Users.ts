import Http from "@lib/http/Http";
import { GITHUB_URL, SOCIAL_NETWORKS } from "@lib/static";
import { container } from "tsyringe";
import "../AppContainer";
import GithubUser from "./GithubUser";
import SocialNetwork from "./SocialNetwork";
import User from "./User";

const http: Http = container.resolve("Http");

export async function getUser(): Promise<User> {
  const user: GithubUser = await http.execute<GithubUser>(GITHUB_URL);
  const socialNetworks: SocialNetwork[] = SOCIAL_NETWORKS;

  return {
    avatar: user.avatar_url,
    username: user.login,
    social: socialNetworks,
  };
}
