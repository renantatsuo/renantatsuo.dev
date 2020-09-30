import SocialNetwork from "@lib/user/SocialNetwork";
import React from "react";
import { SocialList, SocialListItem } from "./styles";

type SocialNetworkListProps = {
  socialNetworks: SocialNetwork[];
};
export default function SocialNetworkList({
  socialNetworks,
}: SocialNetworkListProps) {
  return (
    <SocialList>
      {socialNetworks.map(({ icon: SocialIcon, name, url }) => (
        <SocialListItem key={name}>
          <a href={url} target="_blank">
            <SocialIcon title={name} />
          </a>
        </SocialListItem>
      ))}
    </SocialList>
  );
}
