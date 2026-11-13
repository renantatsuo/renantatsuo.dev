// @vitest-environment jsdom
import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import Comments from "./Comments";

vi.mock("@giscus/react", () => ({
  default: ({ theme }: { theme: string }) => (
    <div data-testid="giscus" data-theme={theme} />
  ),
}));

/** Renders the way the server does: with no `window` around. */
function serverRender(element: React.ReactElement) {
  vi.stubGlobal("window", undefined);
  try {
    return renderToString(element);
  } finally {
    vi.unstubAllGlobals();
  }
}

describe("Comments", () => {
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  });

  it("renders nothing on the server", () => {
    expect(serverRender(<Comments />)).toBe("");
  });

  it("hydrates without a mismatch, then shows the comments", async () => {
    const host = document.body.appendChild(document.createElement("div"));
    host.innerHTML = serverRender(<Comments />);
    const onRecoverableError = vi.fn();

    const root = await React.act(async () =>
      hydrateRoot(host, <Comments />, { onRecoverableError }),
    );

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(
      host.querySelector('[data-testid="giscus"]')?.getAttribute("data-theme"),
    ).toBe(`${window.location.origin}/giscus-theme.css`);
    await React.act(async () => root.unmount());
    host.remove();
  });
});
