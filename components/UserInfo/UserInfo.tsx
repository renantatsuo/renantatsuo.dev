import Link from "next/link";
import SocialNetworkList from "~/components/SocialNetworkList";
import { SOCIAL_NETWORKS } from "~/lib/static";

type UserInfoProps = {
  user: User;
};

function UserInfo({ user }: UserInfoProps) {
  return (
    <div
      className="grid grid-cols-[auto_1fr] grid-rows-2 gap-x-4 h-[60px] w-full my-8"
      style={{ gridTemplateAreas: '"avatar username" "avatar social"' }}
    >
      <img
        src={user.avatar}
        alt={user.username}
        className="row-span-2 max-h-full rounded-full"
        style={{ gridArea: "avatar" }}
      />
      <h2
        className="m-0 text-xl! leading-none self-start grid-area"
        style={{ gridArea: "username" }}
      >
        <Link
          href="/"
          as="/"
          className="font-bold text-foreground! border-none!"
        >
          @{user.username}
        </Link>
      </h2>
      <SocialNetworkList socialNetworks={SOCIAL_NETWORKS} />
    </div>
  );
}

export default UserInfo;
