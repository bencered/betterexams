import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User"],
        allow: "/",
      },
      {
        userAgent: ["Anthropic", "ClaudeBot", "Claude-Web"],
        allow: "/",
      },
      {
        userAgent: ["PerplexityBot", "Bytespider", "Cohere-AI"],
        allow: "/",
      },
    ],
    sitemap: "https://betterexams.ie/sitemap.xml",
  };
}
