import SocialNetwork from "@lib/user/SocialNetwork";
import { FiCodepen, FiGithub, FiLinkedin, FiTwitter } from "react-icons/fi";

/**
 * Some static information.
 */
export const GITHUB_URL = "https://api.github.com/users/renantatsuo";

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  {
    name: "github",
    icon: FiGithub,
    url: "https://github.com/renantatsuo",
  },
  {
    name: "codepen",
    icon: FiCodepen,
    url: "https://codepen.io/renantatsuo",
  },
  {
    name: "twitter",
    icon: FiTwitter,
    url: "https://twitter.com/renantatsuo",
  },
  {
    name: "linkedin",
    icon: FiLinkedin,
    url: "https://linkedin.com/in/renantatsuo/",
  },
];
