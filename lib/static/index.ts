import SocialNetwork, { SocialNetworks } from "@lib/user/SocialNetwork";
/**
 * Some static information.
 */

export const GITHUB_URL = "https://api.github.com/users/renantatsuo";

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  {
    name: SocialNetworks.GITHUB,
    url: "https://github.com/renantatsuo",
  },
  {
    name: SocialNetworks.CODEPEN,
    url: "https://codepen.io/renantatsuo",
  },
  {
    name: SocialNetworks.TWITTER,
    url: "https://twitter.com/renantatsuo",
  },
];
