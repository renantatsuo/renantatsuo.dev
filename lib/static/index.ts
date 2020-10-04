import LottieType from "@components/Icons/LottieType";
import SocialNetwork from "@lib/user/SocialNetwork";

/**
 * Some static information.
 */
export const DATE_FORMATTER_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  year: "numeric",
};

export const GITHUB_URL = "https://api.github.com/users/renantatsuo";

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  {
    name: "codepen",
    icon: LottieType.CODEPEN,
    url: "https://codepen.io/renantatsuo",
  },
  {
    name: "github",
    icon: LottieType.GITHUB,
    url: "https://github.com/renantatsuo",
  },
  {
    name: "linkedin",
    icon: LottieType.LINKEDIN,
    url: "https://linkedin.com/in/renantatsuo/",
  },
  {
    name: "twitter",
    icon: LottieType.TWITTER,
    url: "https://twitter.com/renantatsuo",
  },
];
