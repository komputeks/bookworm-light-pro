/** Navigation menu configuration. */
export const mainMenu = [
  { name: "Home", url: "/" },
  { name: "Blog", url: "/blog" },
  { name: "Categories", url: "/categories" },
  { name: "Tags", url: "/tags" },
  { name: "Authors", url: "/authors" },
  { name: "About", url: "/about" },
  { name: "Contact", url: "/contact" },
  { name: "Docs", url: "/docs" },
] as const;

export const footerMenu = [
  { name: "About", url: "/about" },
  { name: "Contact", url: "/contact" },
  { name: "Categories", url: "/categories" },
  { name: "Tags", url: "/tags" },
  { name: "Docs", url: "/docs" },
] as const;

export const adminMenu = [
  { name: "Dashboard", url: "/admin" },
  { name: "Posts", url: "/admin/posts" },
  { name: "Users", url: "/admin/users" },
  { name: "Categories", url: "/admin/categories" },
  { name: "Sync Logs", url: "/admin/sync-logs" },
  { name: "Payments", url: "/admin/payments" },
  { name: "Settings", url: "/admin/settings" },
] as const;
