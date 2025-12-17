import HoverLottie from "~/components/Icons/HoverLottie";
import SocialNetwork from "~/lib/user/SocialNetwork";

type SocialNetworkListProps = {
  socialNetworks: SocialNetwork[];
};

function SocialNetworkList({ socialNetworks }: SocialNetworkListProps) {
  return (
    <ul className="list-none flex m-0 p-0 self-center" style={{ gridArea: 'social' }}>
      {socialNetworks.map(({ icon, name, url }) => (
        <li key={name} className="mx-1 first:ml-0 last:mr-0" style={{ gridArea: 'social' }}>
          <a href={url} target="_blank" className="!border-none flex items-center">
            <div className="flex h-6">
              <HoverLottie icon={icon} title={name} color="#FF235B" />
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default SocialNetworkList;
