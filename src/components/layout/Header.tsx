import { HeaderInteractive } from "./HeaderInteractive";

const HEADER_NAVIGATION = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/thoughts", label: "Thoughts" },
  { href: "/unmarketing-careers", label: "Careers" },
  { href: "/contact", label: "Contact us" },
] as const;

export function Header() {
  return <HeaderInteractive navigation={HEADER_NAVIGATION} />;
}
