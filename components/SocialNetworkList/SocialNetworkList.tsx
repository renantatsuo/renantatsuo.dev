import { useTheme } from "styled-components";
import HoverLottie from "~/components/Icons/HoverLottie";
import SocialNetwork from "~/lib/user/SocialNetwork";
import { SocialList, SocialListItem } from "./SocialNetworkList.styled";

type SocialNetworkListProps = {
  socialNetworks: SocialNetwork[];
};

function SocialNetworkList({ socialNetworks }: SocialNetworkListProps) {
  const theme = useTheme();
  return (
    <SocialList>
      {socialNetworks.map(({ icon, name, url }) => (
        <SocialListItem key={name}>
          <a href={url} target="_blank">
            <HoverLottie icon={icon} title={name} color={theme.primary} />
          </a>
        </SocialListItem>
      ))}
    </SocialList>
  );
}

export default SocialNetworkList;
