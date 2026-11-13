// @vitest-environment jsdom
import type { AnimationItem } from "lottie-web";
import * as React from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { mountAnimation } from "~/lib/lottie_poster/player";
import HoverLottie from "./HoverLottie";

vi.mock("~/lib/lottie_poster/player", () => ({ mountAnimation: vi.fn() }));

const POSTER = '<svg data-testid="poster"></svg>';
const data: object = { layers: [] };

const item = {
  goToAndPlay: vi.fn(),
  goToAndStop: vi.fn(),
  destroy: vi.fn(),
};
const mount = vi.mocked(mountAnimation);
const animation = vi.fn(async () => ({ default: data }));

let host: HTMLDivElement;
let root: Root;

const icon = () => host.firstElementChild as HTMLElement;
const stage = () => icon().firstElementChild as HTMLElement;
const poster = () => host.querySelector('[data-testid="poster"]');

// React 19.2 ships Activity; the installed react types predate it.
const { Activity } = React as unknown as {
  Activity: React.FC<{
    mode: "visible" | "hidden";
    children: React.ReactNode;
  }>;
};

/** React derives pointerenter/leave from pointerover/out. */
const pointer = (type: "pointerover" | "pointerout") =>
  React.act(async () => {
    icon().dispatchEvent(
      new MouseEvent(type, { bubbles: true, relatedTarget: document.body }),
    );
  });

const render = (mode: "visible" | "hidden" = "visible") =>
  React.act(async () => {
    root.render(
      <Activity mode={mode}>
        <HoverLottie poster={POSTER} animation={animation} className="size-6" />
      </Activity>,
    );
  });

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
  mount.mockResolvedValue(item as unknown as AnimationItem);
  host = document.body.appendChild(document.createElement("div"));
  root = createRoot(host);
});

afterEach(async () => {
  await React.act(async () => root.unmount());
  host.remove();
  vi.clearAllMocks();
});

describe("HoverLottie", () => {
  it("server-renders the poster without loading anything", () => {
    const html = renderToString(
      <HoverLottie poster={POSTER} animation={animation} className="size-6" />,
    );

    expect(html).toContain(POSTER);
    expect(html).toContain("size-6");
    expect(html).toContain('aria-hidden="true"');
    expect(animation).not.toHaveBeenCalled();
  });

  it("shows the poster and stays idle until hovered", async () => {
    await render();

    expect(poster()).not.toBeNull();
    expect(animation).not.toHaveBeenCalled();
    expect(mount).not.toHaveBeenCalled();
  });

  it("keeps an empty stage right before the poster, which is what hides the poster once the stage is drawn on", async () => {
    await render();

    expect(stage().childNodes).toHaveLength(0);
    expect(stage().nextElementSibling).toBe(poster()?.parentElement);
  });

  it("hydrates the server markup without replacing it", async () => {
    const element = (
      <HoverLottie poster={POSTER} animation={animation} className="size-6" />
    );
    host.innerHTML = renderToString(element);
    const serverPoster = poster();
    const onRecoverableError = vi.fn();

    const hydrated = await React.act(async () =>
      hydrateRoot(host, element, { onRecoverableError }),
    );

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(poster()).toBe(serverPoster);
    await React.act(async () => hydrated.unmount());
  });

  it("loads the animation onto the stage on first hover and plays", async () => {
    await render();

    await pointer("pointerover");

    expect(mount).toHaveBeenCalledWith(stage(), data);
    expect(item.goToAndPlay).toHaveBeenCalledWith(0, true);
  });

  it("rewinds to the first frame when the pointer leaves", async () => {
    await render();
    await pointer("pointerover");

    await pointer("pointerout");

    expect(item.goToAndStop).toHaveBeenCalledWith(0, true);
  });

  it("replays on later hovers without loading again", async () => {
    await render();
    await pointer("pointerover");
    await pointer("pointerout");

    await pointer("pointerover");

    expect(animation).toHaveBeenCalledTimes(1);
    expect(mount).toHaveBeenCalledTimes(1);
    expect(item.goToAndPlay).toHaveBeenCalledTimes(2);
  });

  it("does not play if the pointer left while the animation was loading", async () => {
    let finish = (_: { default: object }) => {};
    animation.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    await render();
    await pointer("pointerover");
    await pointer("pointerout");

    await React.act(async () => finish({ default: data }));

    expect(mount).toHaveBeenCalledTimes(1);
    expect(item.goToAndPlay).not.toHaveBeenCalled();
    expect(item.goToAndStop).toHaveBeenCalledWith(0, true);
  });

  it("keeps the static poster when the device asks for reduced motion", async () => {
    window.matchMedia = vi.fn(() => ({ matches: true }) as MediaQueryList);
    await render();

    await pointer("pointerover");

    expect(window.matchMedia).toHaveBeenCalledWith(
      "(prefers-reduced-motion: reduce)",
    );
    expect(animation).not.toHaveBeenCalled();
    expect(poster()).not.toBeNull();
  });

  it("keeps the poster when loading fails and retries on the next hover", async () => {
    animation.mockRejectedValueOnce(new Error("offline"));
    await render();

    await pointer("pointerover");
    await pointer("pointerout");

    expect(poster()).not.toBeNull();
    expect(mount).not.toHaveBeenCalled();

    await pointer("pointerover");

    expect(animation).toHaveBeenCalledTimes(2);
    expect(mount).toHaveBeenCalledTimes(1);
    expect(item.goToAndPlay).toHaveBeenCalledTimes(1);
  });

  it("stays quiet when a load fails after the pointer already left", async () => {
    let fail = (_: Error) => {};
    animation.mockReturnValueOnce(
      new Promise((_, reject) => {
        fail = reject;
      }),
    );
    await render();
    await pointer("pointerover");
    await pointer("pointerout");

    await React.act(async () => fail(new Error("offline")));

    expect(poster()).not.toBeNull();
    expect(item.goToAndStop).not.toHaveBeenCalled();
  });

  it("destroys the animation on unmount", async () => {
    await render();
    await pointer("pointerover");

    await React.act(async () => root.unmount());

    expect(item.destroy).toHaveBeenCalledTimes(1);
  });

  it("destroys an animation that finishes loading after unmount", async () => {
    let finish = (_: { default: object }) => {};
    animation.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    await render();
    await pointer("pointerover");
    await React.act(async () => root.unmount());
    expect(item.destroy).not.toHaveBeenCalled();

    await React.act(async () => finish({ default: data }));

    expect(item.destroy).toHaveBeenCalledTimes(1);
  });

  it("starts over when its effects are torn down and set up again", async () => {
    await render();
    await pointer("pointerover");

    await render("hidden");
    await render("visible");

    expect(item.destroy).toHaveBeenCalledTimes(1);
    expect(poster()).not.toBeNull();

    await pointer("pointerout");
    await pointer("pointerover");

    expect(mount).toHaveBeenCalledTimes(2);
    expect(item.goToAndPlay).toHaveBeenCalledTimes(2);
  });

  it("does not let a stale failed load cancel a newer one", async () => {
    let fail = (_: Error) => {};
    animation.mockReturnValueOnce(
      new Promise((_, reject) => {
        fail = reject;
      }),
    );
    await render();
    await pointer("pointerover");
    await render("hidden");
    await render("visible");
    await pointer("pointerout");
    await pointer("pointerover");

    await React.act(async () => fail(new Error("offline")));
    await pointer("pointerout");
    await pointer("pointerover");

    expect(animation).toHaveBeenCalledTimes(2);
    expect(mount).toHaveBeenCalledTimes(1);
  });

  it("has nothing to destroy if it was never hovered", async () => {
    await render();

    await React.act(async () => root.unmount());

    expect(item.destroy).not.toHaveBeenCalled();
  });
});
