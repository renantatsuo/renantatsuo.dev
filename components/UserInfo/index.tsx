import { SOCIAL_NETWORKS } from "@lib/static";
import SocialNetwork from "@lib/user/SocialNetwork";
import User from "@lib/user/User";
import React from "react";
import {
  SocialList,
  SocialListItem,
  UserAvatar,
  UserContainer,
  Username,
} from "./styles";

type UserInfoProps = {
  user: User;
};

function renderSocialList(socialNetworks: SocialNetwork[]) {
  return socialNetworks.map(({ icon: SocialIcon, name, url }) => (
    <SocialListItem>
      <a href={url} target="_blank">
        <SocialIcon title={name} />
      </a>
    </SocialListItem>
  ));
}

export default function UserInfo({ user }: UserInfoProps) {
  return (
    <UserContainer>
      <UserAvatar src={user.avatar} />
      <Username>@{user.username}</Username>
      <SocialList>{renderSocialList(SOCIAL_NETWORKS)}</SocialList>
    </UserContainer>
  );
}
