import { Link } from "@tanstack/react-router";
import SocialNetworkList from "~/components/SocialNetworkList";
import { SOCIAL_NETWORKS } from "~/lib/static";

type UserInfoProps = {
  user: User;
};

function UserInfo({ user }: UserInfoProps) {
  return (
    <div
      className="my-8 grid h-[60px] w-full grid-cols-[auto_1fr] grid-rows-2
        gap-x-4"
      style={{ gridTemplateAreas: '"avatar username" "avatar social"' }}
    >
      <img
        src={user.avatar}
        alt={user.username}
        className="row-span-2 max-h-full rounded-full"
        style={{ gridArea: "avatar" }}
      />
      <h2
        className="grid-area m-0 self-start text-xl! leading-none"
        style={{ gridArea: "username" }}
      >
        <Link to="/" className="text-foreground! border-none! font-bold">
          @{user.username}
        </Link>
      </h2>
      <SocialNetworkList socialNetworks={SOCIAL_NETWORKS} />
    </div>
  );
}

export default UserInfo;
