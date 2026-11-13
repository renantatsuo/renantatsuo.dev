import { GITHUB_URL } from "~/lib/static";
import { getUser } from "./Users";

const fetchMock = vi.fn(async (_: Request) =>
  Response.json({
    login: "renantatsuo",
    avatar_url: "https://avatars.githubusercontent.com/u/1",
  }),
);

const sentRequest = () => fetchMock.mock.calls[0][0];

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  fetchMock.mockClear();
});

describe("getUser", () => {
  it("maps the github profile to a user", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");

    await expect(getUser()).resolves.toEqual({
      username: "renantatsuo",
      avatar: "https://avatars.githubusercontent.com/u/1",
    });
    expect(sentRequest().url).toBe(GITHUB_URL);
  });

  it("authenticates the request when a token is configured", async () => {
    vi.stubEnv("GITHUB_TOKEN", "secret-token");

    await getUser();

    expect(sentRequest().headers.get("Authorization")).toBe(
      "Bearer secret-token",
    );
  });

  it("stays anonymous when no token is configured", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");

    await getUser();

    expect(sentRequest().headers.has("Authorization")).toBe(false);
  });
});
