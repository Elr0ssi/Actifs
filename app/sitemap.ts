import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://actifs.app", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://actifs.app/login", lastModified: new Date() },
    { url: "https://actifs.app/signup", lastModified: new Date() },
  ];
}
