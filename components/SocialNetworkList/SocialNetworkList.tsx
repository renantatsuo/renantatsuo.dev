import HoverLottie from "@components/Icons/HoverLottie";
import SocialNetwork from "@lib/user/SocialNetwork";
import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import { SocialList, SocialListItem } from "./SocialNetworkList.styled";

type SocialNetworkListProps = {
  socialNetworks: SocialNetwork[];
};

function SocialNetworkList({ socialNetworks }: SocialNetworkListProps) {
  const theme = useContext(ThemeContext);
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
