import Link from "next/link";
import React from "react";
import SocialNetworkList from "~/components/SocialNetworkList";
import { SOCIAL_NETWORKS } from "~/lib/static";
import { UserAvatar, UserContainer, Username } from "./UserInfo.styled";

type UserInfoProps = {
  user: User;
};

function UserInfo({ user }: UserInfoProps) {
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

export default UserInfo;
