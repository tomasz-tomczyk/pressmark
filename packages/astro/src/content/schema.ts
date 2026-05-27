import { z } from "astro:content";

/**
 * Reusable Pressmark post-collection schema. Pass to `defineCollection({ schema: postSchema })`.
 *
 * Example:
 *
 *   import { defineCollection } from "astro:content";
 *   import { postSchema } from "@pressmark/astro/content/schema";
 *
 *   export const collections = {
 *     posts: defineCollection({ type: "content", schema: postSchema }),
 *   };
 */
export const postSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  tags: z.array(z.string()).optional(),
  readingTime: z.string().optional(),
  cover: z.string().optional(),
  relatedSlugs: z.array(z.string()).optional(),
});

export type Post = z.infer<typeof postSchema>;
