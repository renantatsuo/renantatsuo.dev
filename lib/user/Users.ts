import type { HttpClient } from "~/lib/http/HttpClient";
import { TypedFetch } from "~/lib/http/TypedFetch";
import { GITHUB_URL } from "~/lib/static";

/**
 * Retrieve user data from Github.
 *
 * Anonymous requests share a limit of 60 an hour per IP, which a shared CI
 * runner can exhaust. With `GITHUB_TOKEN` set the request is authenticated.
 */
export async function getUser(): Promise<User> {
  const httpClient: HttpClient = new TypedFetch();
  const token = process.env.GITHUB_TOKEN;
  const user: GithubUser = await httpClient.get<GithubUser>(GITHUB_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return {
    avatar: user.avatar_url,
    username: user.login,
  };
}
