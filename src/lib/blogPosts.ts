import { ActionError } from "astro:actions";
import { BlogPosts, and, db, desc, eq } from "astro:db";

export const BLOG_POST_STATUSES = ["draft", "in-review", "ready"] as const;

export type BlogPostStatus = (typeof BLOG_POST_STATUSES)[number];

export type BlogPostInput = {
  title: string;
  slug?: string | null;
  category?: string | null;
  tags?: string | null;
  summary?: string | null;
  content: string;
  status?: BlogPostStatus;
  notes?: string | null;
};

export type BlogPostListFilters = {
  search?: string;
  status?: BlogPostStatus | "";
  category?: string;
  favoriteOnly?: boolean;
  archived?: boolean;
};

export type BlogPostRecord = Awaited<ReturnType<typeof loadOwnedBlogPost>>;

function asOptional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function ensureTitle(value: string) {
  const title = value.trim();
  if (!title) {
    throw new ActionError({ code: "BAD_REQUEST", message: "Title is required." });
  }
  return title;
}

function ensureContent(value: string) {
  const content = value.trim();
  if (!content) {
    throw new ActionError({ code: "BAD_REQUEST", message: "Content is required." });
  }
  return content;
}

function ensureStatus(value: string): BlogPostStatus {
  if ((BLOG_POST_STATUSES as readonly string[]).includes(value)) {
    return value as BlogPostStatus;
  }
  throw new ActionError({ code: "BAD_REQUEST", message: "Invalid status." });
}

function normalizeSlug(value?: string | null) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) return null;

  const normalized = trimmed
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || null;
}

function normalizeCategory(value?: string | null) {
  const category = value?.trim();
  return category ? category : null;
}

function normalizeTags(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return null;

  const normalized = raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(", ");

  return normalized || null;
}

export function parseBlogPostInput(input: Record<string, FormDataEntryValue | null>): BlogPostInput {
  return {
    title: ensureTitle(String(input.title ?? "")),
    slug: normalizeSlug(String(input.slug ?? "")),
    category: normalizeCategory(String(input.category ?? "")),
    tags: normalizeTags(String(input.tags ?? "")),
    summary: asOptional(String(input.summary ?? "")),
    content: ensureContent(String(input.content ?? "")),
    status: ensureStatus(String(input.status ?? "draft")),
    notes: asOptional(String(input.notes ?? "")),
  };
}

async function loadOwnedBlogPost(userId: string, id: number) {
  const [record] = await db
    .select()
    .from(BlogPosts)
    .where(and(eq(BlogPosts.userId, userId), eq(BlogPosts.id, id)))
    .limit(1);

  if (!record) {
    throw new ActionError({ code: "NOT_FOUND", message: "Blog post not found." });
  }

  return record;
}

function matchesSearch(record: BlogPostRecord, query: string) {
  if (!query) return true;

  const haystack = [
    record.title,
    record.slug ?? "",
    record.category ?? "",
    record.tags ?? "",
    record.summary ?? "",
    record.content,
    record.notes ?? "",
  ].map((value) => value.toLowerCase());

  return haystack.some((value) => value.includes(query));
}

export async function listBlogPostsForUser(userId: string, filters: BlogPostListFilters = {}) {
  const records = await db
    .select()
    .from(BlogPosts)
    .where(eq(BlogPosts.userId, userId))
    .orderBy(desc(BlogPosts.updatedAt));

  const query = (filters.search ?? "").trim().toLowerCase();
  const categoryFilter = filters.category?.trim().toLowerCase() ?? "";

  return records.filter((record) => {
    const matchesArchived =
      typeof filters.archived === "boolean" ? record.isArchived === filters.archived : true;
    const matchesStatus = filters.status ? record.status === filters.status : true;
    const matchesFavorite = filters.favoriteOnly ? record.isFavorite : true;
    const matchesCategory = categoryFilter
      ? (record.category ?? "").toLowerCase() === categoryFilter
      : true;
    const matchesQuery = matchesSearch(record, query);

    return matchesArchived && matchesStatus && matchesFavorite && matchesCategory && matchesQuery;
  });
}

export async function summarizeBlogPostsForUser(userId: string) {
  const records = await listBlogPostsForUser(userId);
  return {
    total: records.length,
    active: records.filter((record) => !record.isArchived).length,
    archived: records.filter((record) => record.isArchived).length,
    favorites: records.filter((record) => record.isFavorite).length,
  };
}

export async function listCategoriesForUser(userId: string) {
  const records = await db.select().from(BlogPosts).where(eq(BlogPosts.userId, userId));
  return [...new Set(records.map((record) => record.category).filter(Boolean))].sort();
}

export async function getBlogPostDetailForUser(userId: string, id: number) {
  return loadOwnedBlogPost(userId, id);
}

export async function createBlogPostForUser(userId: string, input: BlogPostInput) {
  const now = new Date();
  const [record] = await db
    .insert(BlogPosts)
    .values({
      userId,
      title: input.title,
      slug: input.slug ?? null,
      category: input.category ?? null,
      tags: input.tags ?? null,
      summary: input.summary ?? null,
      content: input.content,
      status: input.status ?? "draft",
      notes: input.notes ?? null,
      isFavorite: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return record;
}

export async function updateBlogPostForUser(userId: string, id: number, input: BlogPostInput) {
  await loadOwnedBlogPost(userId, id);
  const [record] = await db
    .update(BlogPosts)
    .set({
      title: input.title,
      slug: input.slug ?? null,
      category: input.category ?? null,
      tags: input.tags ?? null,
      summary: input.summary ?? null,
      content: input.content,
      status: input.status ?? "draft",
      notes: input.notes ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(BlogPosts.userId, userId), eq(BlogPosts.id, id)))
    .returning();

  return record;
}

export async function toggleBlogPostFavoriteForUser(userId: string, id: number) {
  const existing = await loadOwnedBlogPost(userId, id);
  const [record] = await db
    .update(BlogPosts)
    .set({
      isFavorite: !existing.isFavorite,
      updatedAt: new Date(),
    })
    .where(and(eq(BlogPosts.userId, userId), eq(BlogPosts.id, id)))
    .returning();

  return record;
}

export async function archiveBlogPostForUser(userId: string, id: number) {
  const existing = await loadOwnedBlogPost(userId, id);
  if (existing.isArchived) return existing;

  const [record] = await db
    .update(BlogPosts)
    .set({
      isArchived: true,
      updatedAt: new Date(),
    })
    .where(and(eq(BlogPosts.userId, userId), eq(BlogPosts.id, id)))
    .returning();

  return record;
}

export async function restoreBlogPostForUser(userId: string, id: number) {
  const existing = await loadOwnedBlogPost(userId, id);
  if (!existing.isArchived) return existing;

  const [record] = await db
    .update(BlogPosts)
    .set({
      isArchived: false,
      updatedAt: new Date(),
    })
    .where(and(eq(BlogPosts.userId, userId), eq(BlogPosts.id, id)))
    .returning();

  return record;
}
