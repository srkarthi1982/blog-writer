/**
 * Blog Writer - draft SEO-friendly blog posts with multiple versions.
 *
 * Design goals:
 * - A user can have many blog posts.
 * - Each post can have multiple AI-generated or user-edited versions.
 * - Store basic SEO metadata for future blog export features.
 */

import { defineTable, column, NOW } from "astro:db";

export const BlogPosts = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    title: column.text(),
    slug: column.text({ optional: true }),        // optional, for future publishing
    topic: column.text({ optional: true }),       // e.g. "Astro DB basics"
    language: column.text({ optional: true }),    // "en", "ta", etc.
    status: column.text({ optional: true }),      // "idea", "draft", "final"
    targetAudience: column.text({ optional: true }),
    mainKeyword: column.text({ optional: true }), // primary SEO keyword
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export const BlogPostVersions = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    postId: column.text({
      references: () => BlogPosts.columns.id,
    }),
    versionLabel: column.text({ optional: true }), // "v1", "SEO variant A", etc.
    isPreferred: column.boolean({ default: false }),
    outline: column.text({ optional: true }),      // outline or bullet plan
    content: column.text(),                        // full blog content
    readingTimeMinutes: column.number({ optional: true }),
    tone: column.text({ optional: true }),         // "friendly", "expert", etc.
    createdAt: column.date({ default: NOW }),
  },
});

export const BlogSeoMeta = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    postId: column.text({
      references: () => BlogPosts.columns.id,
    }),
    metaTitle: column.text({ optional: true }),
    metaDescription: column.text({ optional: true }),
    keywords: column.text({ optional: true }),     // comma-separated or JSON
    ogTitle: column.text({ optional: true }),
    ogDescription: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
});

export const tables = {
  BlogPosts,
  BlogPostVersions,
  BlogSeoMeta,
} as const;
