import HoverLottie from "~/components/Icons/HoverLottie";
import { ICONS } from "~/components/Icons/icons";
import type SocialNetwork from "~/lib/user/SocialNetwork";

type SocialNetworkListProps = {
  socialNetworks: SocialNetwork[];
};

function SocialNetworkList({ socialNetworks }: SocialNetworkListProps) {
  return (
    <ul
      className="m-0 flex list-none self-center p-0"
      style={{ gridArea: "social" }}
    >
      {socialNetworks.map(({ icon, name, url }) => (
        <li
          key={name}
          className="mx-1 first:ml-0 last:mr-0"
          style={{ gridArea: "social" }}
        >
          <a
            href={url}
            target="_blank"
            className="flex items-center border-none!"
            rel="noopener"
            aria-label={name}
            title={name}
          >
            <HoverLottie
              {...ICONS[icon]}
              className="size-6 text-primary [&_[fill]]:fill-current [&_[stroke]]:stroke-current"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}

export default SocialNetworkList;
