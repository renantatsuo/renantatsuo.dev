import SocialNetworkList from "@components/SocialNetworkList";
import { SOCIAL_NETWORKS } from "@lib/static";
import Link from "next/link";
import React from "react";
import { UserAvatar, UserContainer, Username } from "./styles";

type UserInfoProps = {
  user: User;
};

export default function UserInfo({ user }: UserInfoProps) {
  return (
    <UserContainer>
      <UserAvatar src={user.avatar} />
      <Username>
        <Link href="/" as="/">
          <a>@{user.username}</a>
        </Link>
      </Username>
      <SocialNetworkList socialNetworks={SOCIAL_NETWORKS} />
    </UserContainer>
  );
}
