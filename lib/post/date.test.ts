import { formatPostDate } from "~/lib/post/date";

describe("Test formatPostDate()", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("Should format the date as written", () => {
    expect(formatPostDate("2026-04-21")).toBe("4/21/2026");
  });

  it("Should keep the written day west of UTC", () => {
    vi.stubEnv("TZ", "America/Sao_Paulo");
    // Guards the test itself: there, local time is still the previous day.
    expect(new Date("2026-04-21").getDate()).toBe(20);

    expect(formatPostDate("2026-04-21")).toBe("4/21/2026");
  });
});
