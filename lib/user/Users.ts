import { HttpClient } from "~/lib/http/HttpClient";
import { TypedFetch } from "~/lib/http/TypedFetch";
import { GITHUB_URL } from "~/lib/static";

/**
 * Retrieve user data from Github.
 */
export async function getUser(): Promise<User> {
  const httpClient: HttpClient = new TypedFetch();
  const user: GithubUser = await httpClient.get<GithubUser>(GITHUB_URL);

  return {
    avatar: user.avatar_url,
    username: user.login,
  };
}
