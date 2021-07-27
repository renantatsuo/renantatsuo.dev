import AppContainer from "~/lib/AppContainer";
import Http from "~/lib/http/Http";
import { GITHUB_URL } from "~/lib/static";

const http: Http = AppContainer.get<Http>("Http");

/**
 * Retrieve user data from Github.
 */
export async function getUser(): Promise<User> {
  const user: GithubUser = await http.execute<GithubUser>(GITHUB_URL);

  return {
    avatar: user.avatar_url,
    username: user.login,
  };
}
