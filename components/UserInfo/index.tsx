import SocialNetworkList from "@components/SocialNetworkList";
import { SOCIAL_NETWORKS } from "@lib/static";
import User from "@lib/user/User";
import React from "react";
import { UserAvatar, UserContainer, Username } from "./styles";

type UserInfoProps = {
  user: User;
};

export default function UserInfo({ user }: UserInfoProps) {
  return (
    <UserContainer>
      <UserAvatar src={user.avatar} />
      <Username>@{user.username}</Username>
      <SocialNetworkList socialNetworks={SOCIAL_NETWORKS} />
    </UserContainer>
  );
}
