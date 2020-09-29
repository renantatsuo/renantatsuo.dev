export enum SocialNetworks {
  TWITTER = "twitter",
  GITHUB = "github",
  CODEPEN = "codepen",
}

type SocialNetwork = {
  name: SocialNetworks;
  url: string;
};

export default SocialNetwork;
