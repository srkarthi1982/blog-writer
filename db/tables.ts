import { column, defineTable, NOW } from "astro:db";

export const BlogPosts = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userId: column.text(),
    title: column.text(),
    slug: column.text({ optional: true }),
    category: column.text({ optional: true }),
    tags: column.text({ optional: true }),
    summary: column.text({ optional: true }),
    content: column.text(),
    status: column.text({ enum: ["draft", "in-review", "ready"], default: "draft" }),
    notes: column.text({ optional: true }),
    isFavorite: column.boolean({ default: false }),
    isArchived: column.boolean({ default: false }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
  indexes: [
    { on: ["userId"] },
    { on: ["userId", "status"] },
    { on: ["userId", "isFavorite"] },
    { on: ["userId", "isArchived"] },
    { on: ["userId", "category"] },
    { on: ["userId", "updatedAt"] },
  ],
});

export const blogWriterTables = {
  BlogPosts,
} as const;
