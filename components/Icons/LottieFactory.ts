import Codepen from "./Animations/codepen.json";
import Github from "./Animations/github.json";
import Linkedin from "./Animations/linkedin.json";
import Twitter from "./Animations/twitter.json";
import Lottie from "./Lottie";
import LottieType from "./LottieType";

/**
 * A factory to create a Lottie object based on the LottieType.
 */
class LottieFactory {
  create(animation: LottieType): Lottie {
    switch (animation) {
      case LottieType.CODEPEN:
        return {
          type: animation,
          data: Codepen,
        };

      case LottieType.GITHUB:
        return {
          type: animation,
          data: Github,
        };

      case LottieType.LINKEDIN:
        return {
          type: animation,
          data: Linkedin,
        };

      case LottieType.TWITTER:
        return {
          type: animation,
          data: Twitter,
        };
    }
  }
}

export default new LottieFactory();
