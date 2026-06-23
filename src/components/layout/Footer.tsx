import Link from "next/link";
import { footerMenu, siteConfig } from "@config";
import { FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  const socials = [
    { icon: FaTwitter, url: siteConfig.social.twitter, label: "Twitter" },
    { icon: FaFacebook, url: siteConfig.social.facebook, label: "Facebook" },
    { icon: FaInstagram, url: siteConfig.social.instagram, label: "Instagram" },
    { icon: FaYoutube, url: siteConfig.social.youtube, label: "YouTube" },
    { icon: FaLinkedin, url: siteConfig.social.linkedin, label: "LinkedIn" },
    { icon: FaGithub, url: siteConfig.social.github, label: "GitHub" },
  ];

  return (
    <footer className="bg-theme-dark py-12 text-text-light">
      <div className="container-wide text-center">
        <Link href="/" className="mb-4 inline-block text-xl font-bold text-white">
          {siteConfig.name}
        </Link>
        <p className="mx-auto mb-6 max-w-md text-sm">{siteConfig.description}</p>

        {/* Footer menu */}
        <ul className="mb-6 flex flex-wrap justify-center gap-4">
          {footerMenu.map((item) => (
            <li key={item.url}>
              <Link href={item.url} className="text-sm text-text-light transition hover:text-white">{item.name}</Link>
            </li>
          ))}
        </ul>

        {/* Social icons */}
        <ul className="mb-6 flex justify-center gap-3">
          {socials.map(({ icon: Icon, url, label }) => (
            <li key={label}>
              <a href={url} target="_blank" rel="noreferrer noopener" aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-600 text-text-light transition hover:border-primary hover:bg-primary hover:text-white">
                <Icon />
              </a>
            </li>
          ))}
        </ul>

        <p className="text-xs text-text-light">
          © {new Date().getFullYear()} {siteConfig.name}. Built with Next.js, Supabase & Google Sheets sync.
        </p>
      </div>
    </footer>
  );
}
