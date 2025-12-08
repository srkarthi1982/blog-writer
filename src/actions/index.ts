import { defineAction, ActionError, type ActionAPIContext } from "astro:actions";
import { z } from "astro:schema";
import {
  BlogPostVersions,
  BlogPosts,
  BlogSeoMeta,
  and,
  db,
  eq,
} from "astro:db";

function requireUser(context: ActionAPIContext) {
  const locals = context.locals as App.Locals | undefined;
  const user = locals?.user;

  if (!user) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to perform this action.",
    });
  }

  return user;
}

async function getOwnedPost(postId: string, userId: string) {
  const [post] = await db
    .select()
    .from(BlogPosts)
    .where(and(eq(BlogPosts.id, postId), eq(BlogPosts.userId, userId)));

  if (!post) {
    throw new ActionError({
      code: "NOT_FOUND",
      message: "Blog post not found.",
    });
  }

  return post;
}

async function getOwnedVersion(versionId: string, postId: string, userId: string) {
  await getOwnedPost(postId, userId);

  const [version] = await db
    .select()
    .from(BlogPostVersions)
    .where(and(eq(BlogPostVersions.id, versionId), eq(BlogPostVersions.postId, postId)));

  if (!version) {
    throw new ActionError({
      code: "NOT_FOUND",
      message: "Post version not found.",
    });
  }

  return version;
}

export const server = {
  createPost: defineAction({
    input: z.object({
      title: z.string().min(1),
      slug: z.string().optional(),
      topic: z.string().optional(),
      language: z.string().optional(),
      status: z.string().optional(),
      targetAudience: z.string().optional(),
      mainKeyword: z.string().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      const now = new Date();

      const [post] = await db
        .insert(BlogPosts)
        .values({
          id: crypto.randomUUID(),
          userId: user.id,
          title: input.title,
          slug: input.slug,
          topic: input.topic,
          language: input.language,
          status: input.status,
          targetAudience: input.targetAudience,
          mainKeyword: input.mainKeyword,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return {
        success: true,
        data: { post },
      };
    },
  }),

  updatePost: defineAction({
    input: z
      .object({
        id: z.string().min(1),
        title: z.string().min(1).optional(),
        slug: z.string().optional(),
        topic: z.string().optional(),
        language: z.string().optional(),
        status: z.string().optional(),
        targetAudience: z.string().optional(),
        mainKeyword: z.string().optional(),
      })
      .refine(
        (input) =>
          input.title !== undefined ||
          input.slug !== undefined ||
          input.topic !== undefined ||
          input.language !== undefined ||
          input.status !== undefined ||
          input.targetAudience !== undefined ||
          input.mainKeyword !== undefined,
        { message: "At least one field must be provided to update." }
      ),
    handler: async (input, context) => {
      const user = requireUser(context);
      await getOwnedPost(input.id, user.id);

      const [post] = await db
        .update(BlogPosts)
        .set({
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.slug !== undefined ? { slug: input.slug } : {}),
          ...(input.topic !== undefined ? { topic: input.topic } : {}),
          ...(input.language !== undefined ? { language: input.language } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.targetAudience !== undefined
            ? { targetAudience: input.targetAudience }
            : {}),
          ...(input.mainKeyword !== undefined ? { mainKeyword: input.mainKeyword } : {}),
          updatedAt: new Date(),
        })
        .where(eq(BlogPosts.id, input.id))
        .returning();

      return {
        success: true,
        data: { post },
      };
    },
  }),

  listPosts: defineAction({
    input: z.object({}).optional(),
    handler: async (_input, context) => {
      const user = requireUser(context);

      const posts = await db
        .select()
        .from(BlogPosts)
        .where(eq(BlogPosts.userId, user.id));

      return {
        success: true,
        data: { items: posts, total: posts.length },
      };
    },
  }),

  createPostVersion: defineAction({
    input: z.object({
      postId: z.string().min(1),
      versionLabel: z.string().optional(),
      isPreferred: z.boolean().optional(),
      outline: z.string().optional(),
      content: z.string().min(1),
      readingTimeMinutes: z.number().optional(),
      tone: z.string().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      await getOwnedPost(input.postId, user.id);

      const [version] = await db
        .insert(BlogPostVersions)
        .values({
          id: crypto.randomUUID(),
          postId: input.postId,
          versionLabel: input.versionLabel,
          isPreferred: input.isPreferred ?? false,
          outline: input.outline,
          content: input.content,
          readingTimeMinutes: input.readingTimeMinutes,
          tone: input.tone,
          createdAt: new Date(),
        })
        .returning();

      return {
        success: true,
        data: { version },
      };
    },
  }),

  updatePostVersion: defineAction({
    input: z
      .object({
        id: z.string().min(1),
        postId: z.string().min(1),
        versionLabel: z.string().optional(),
        isPreferred: z.boolean().optional(),
        outline: z.string().optional(),
        content: z.string().optional(),
        readingTimeMinutes: z.number().optional(),
        tone: z.string().optional(),
      })
      .refine(
        (input) =>
          input.versionLabel !== undefined ||
          input.isPreferred !== undefined ||
          input.outline !== undefined ||
          input.content !== undefined ||
          input.readingTimeMinutes !== undefined ||
          input.tone !== undefined,
        { message: "At least one field must be provided to update." }
      ),
    handler: async (input, context) => {
      const user = requireUser(context);
      await getOwnedVersion(input.id, input.postId, user.id);

      const [version] = await db
        .update(BlogPostVersions)
        .set({
          ...(input.versionLabel !== undefined ? { versionLabel: input.versionLabel } : {}),
          ...(input.isPreferred !== undefined ? { isPreferred: input.isPreferred } : {}),
          ...(input.outline !== undefined ? { outline: input.outline } : {}),
          ...(input.content !== undefined ? { content: input.content } : {}),
          ...(input.readingTimeMinutes !== undefined
            ? { readingTimeMinutes: input.readingTimeMinutes }
            : {}),
          ...(input.tone !== undefined ? { tone: input.tone } : {}),
        })
        .where(eq(BlogPostVersions.id, input.id))
        .returning();

      return {
        success: true,
        data: { version },
      };
    },
  }),

  deletePostVersion: defineAction({
    input: z.object({
      id: z.string().min(1),
      postId: z.string().min(1),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      await getOwnedVersion(input.id, input.postId, user.id);

      const result = await db
        .delete(BlogPostVersions)
        .where(eq(BlogPostVersions.id, input.id));

      if (result.rowsAffected === 0) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Post version not found.",
        });
      }

      return { success: true };
    },
  }),

  listPostVersions: defineAction({
    input: z.object({
      postId: z.string().min(1),
      preferredOnly: z.boolean().default(false),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      await getOwnedPost(input.postId, user.id);

      const versions = await db
        .select()
        .from(BlogPostVersions)
        .where(
          input.preferredOnly
            ? and(
                eq(BlogPostVersions.postId, input.postId),
                eq(BlogPostVersions.isPreferred, true)
              )
            : eq(BlogPostVersions.postId, input.postId)
        );

      return {
        success: true,
        data: { items: versions, total: versions.length },
      };
    },
  }),

  upsertSeoMeta: defineAction({
    input: z.object({
      postId: z.string().min(1),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.string().optional(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      await getOwnedPost(input.postId, user.id);

      const [existing] = await db
        .select()
        .from(BlogSeoMeta)
        .where(eq(BlogSeoMeta.postId, input.postId));

      if (existing) {
        const [meta] = await db
          .update(BlogSeoMeta)
          .set({
            ...(input.metaTitle !== undefined ? { metaTitle: input.metaTitle } : {}),
            ...(input.metaDescription !== undefined
              ? { metaDescription: input.metaDescription }
              : {}),
            ...(input.keywords !== undefined ? { keywords: input.keywords } : {}),
            ...(input.ogTitle !== undefined ? { ogTitle: input.ogTitle } : {}),
            ...(input.ogDescription !== undefined ? { ogDescription: input.ogDescription } : {}),
          })
          .where(eq(BlogSeoMeta.id, existing.id))
          .returning();

        return {
          success: true,
          data: { seo: meta },
        };
      }

      const [meta] = await db
        .insert(BlogSeoMeta)
        .values({
          id: crypto.randomUUID(),
          postId: input.postId,
          metaTitle: input.metaTitle,
          metaDescription: input.metaDescription,
          keywords: input.keywords,
          ogTitle: input.ogTitle,
          ogDescription: input.ogDescription,
          createdAt: new Date(),
        })
        .returning();

      return {
        success: true,
        data: { seo: meta },
      };
    },
  }),

  getSeoMeta: defineAction({
    input: z.object({
      postId: z.string().min(1),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      await getOwnedPost(input.postId, user.id);

      const [meta] = await db
        .select()
        .from(BlogSeoMeta)
        .where(eq(BlogSeoMeta.postId, input.postId));

      return {
        success: true,
        data: { seo: meta ?? null },
      };
    },
  }),
};
