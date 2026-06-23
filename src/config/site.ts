/** Site-wide configuration — derived from env and defaults. */
import { env } from "./env";

export const siteConfig = {
  name: env.NEXT_PUBLIC_SITE_NAME,
  url: env.NEXT_PUBLIC_SITE_URL,
  description:
    "A modern blogging platform with bi-directional Google Sheets sync. Write in the app or in your spreadsheet — everything stays in sync.",
  tagline: "Write. Sync. Publish.",
  primaryColor: "#01AD9F",
  postsPerPage: 6,
  summaryLength: 200,
  serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  social: {
    twitter: "https://twitter.com/",
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    linkedin: "https://linkedin.com/",
    github: "https://github.com/",
  },
} as const;

export type SiteConfig = typeof siteConfig;
