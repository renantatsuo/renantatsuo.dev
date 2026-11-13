import { renderToString } from "react-dom/server";
import { ICONS } from "~/components/Icons/icons";
import LottieType from "~/components/Icons/LottieType";
import SocialNetworkList from "./SocialNetworkList";

describe("SocialNetworkList", () => {
  it("server-renders each network as a named link with a visible icon", () => {
    const html = renderToString(
      <SocialNetworkList
        socialNetworks={[
          {
            name: "github",
            icon: LottieType.GITHUB,
            url: "https://github.com/x",
          },
          {
            name: "codepen",
            icon: LottieType.CODEPEN,
            url: "https://codepen.io/x",
          },
        ]}
      />,
    );

    expect(html).toContain('href="https://github.com/x"');
    expect(html).toContain('aria-label="github"');
    expect(html).toContain(ICONS[LottieType.GITHUB].poster);
    expect(html).toContain('aria-label="codepen"');
    expect(html).toContain(ICONS[LottieType.CODEPEN].poster);
  });
});
