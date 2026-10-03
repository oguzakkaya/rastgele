import type { NextConfig } from "next";

const pages = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  ...(pages
    ? {
        output: "export" as const,
        basePath: "/rastgele",
        trailingSlash: true,
      }
    : {}),
  images: { unoptimized: true },
};

export default nextConfig;
