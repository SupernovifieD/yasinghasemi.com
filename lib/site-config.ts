export const siteConfig = {
  name: "yasinghasemi.com",
  owner: "Yasin Ghasemi",
  origin: "https://yasinghasemi.com",
  email: {
    label: "y@yasinghasemi.com",
    href: "mailto:y@yasinassemi.com",
  },
  social: {
    github: "https://github.com/SupernovifieD",
    linkedin: "https://www.linkedin.com/in/yasinghasemi/",
  },
} as const;

export const primaryNavigation = [
  { href: "/about", label: "/about" },
  { href: "/contact", label: "/contact" },
  { href: "/blog", label: "/blog" },
] as const;

export const policyNavigation = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Management" },
] as const;
