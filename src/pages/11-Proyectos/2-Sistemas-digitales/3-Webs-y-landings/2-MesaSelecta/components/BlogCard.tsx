import Link from "next/link";
import type { BlogPost } from "@/lib/types";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="blog-card">
      <div className="blog-card-visual" />
      <div className="blog-card-body">
        <span className="eyebrow">{post.category} · {post.readingMinutes} min</span>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        <Link className="text-link" href={`/blog/${post.slug}`}>Leer artículo →</Link>
      </div>
    </article>
  );
}
