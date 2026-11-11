import { FaLinkedin } from "react-icons/fa6";
import { SiGithub, SiInstagram } from "react-icons/si";
import type { SocialLink } from "@/data/profile";

const ICONS: Record<
  SocialLink["key"],
  React.ComponentType<{ size?: number; className?: string }>
> = {
  github: SiGithub,
  linkedin: FaLinkedin,
  instagram: SiInstagram,
};

export function SocialIcon({
  name,
  size = 18,
  className,
}: {
  name: SocialLink["key"];
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[name];
  return <Icon size={size} className={className} aria-hidden />;
}
