import { defineDb } from "astro:db";
import { BlogPosts } from "./tables";

export default defineDb({
  tables: {
    BlogPosts,
  },
});
