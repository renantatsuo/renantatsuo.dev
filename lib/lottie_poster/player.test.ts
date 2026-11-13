import lottie from "lottie-web/build/player/lottie_svg";
import { mountAnimation } from "./player";

vi.mock("lottie-web/build/player/lottie_svg", () => ({
  default: { loadAnimation: vi.fn(() => "animation item") },
}));

describe("mountAnimation", () => {
  it("mounts the animation paused on its first frame, without looping", async () => {
    const container = {} as Element;
    const animationData = { layers: [] };

    const item = await mountAnimation(container, animationData);

    expect(item).toBe("animation item");
    expect(lottie.loadAnimation).toHaveBeenCalledWith({
      container,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData,
    });
  });
});
