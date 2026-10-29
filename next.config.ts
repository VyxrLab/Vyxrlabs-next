import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://cdn.jsdelivr.net/gh/VyxrLab/**")],
  },
  async redirects() {
    return [
      // Old routes that were linked from the previous design.
      { source: "/Service", destination: "/services", permanent: true },
      { source: "/service/:path*", destination: "/services", permanent: true },
      { source: "/contacts", destination: "/contact", permanent: true },
      { source: "/Contacts", destination: "/contact", permanent: true },
      { source: "/abouts", destination: "/#about", permanent: true },
      // Pages the previous site had that this one doesn't.
      { source: "/careers", destination: "/contact", permanent: true },
      { source: "/blogs", destination: "/", permanent: true },
      { source: "/blogs/:slug*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
