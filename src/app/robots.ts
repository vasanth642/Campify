import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://campify.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/feed", "/search"],
      disallow: ["/api/", "/profile/", "/notifications/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
