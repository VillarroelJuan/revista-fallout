import Link from "next/link";
import type { Post } from "@/lib/posts";

type PostCardProps = {
  post: Post;
};

function formatDate(date: string | Date) {
  if (!date) return "";

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsedDate);
}

function createExcerpt(content: string, maxLength = 200) {
  const cleanContent = content
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#*_>`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  return `${cleanContent.substring(0, maxLength).trim()}...`;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className={`post-card ${post.image ? "post-card-with-image" : ""}`}>
      <Link href={`/articulo/${post.slug}`} className="post-card-link">

        {post.image && (
          <div className="post-card-image-container">
            <img
              src={post.image}
              alt={`Portada de ${post.title}`}
              className="post-card-image"
            />
          </div>
        )}

        <div className="post-card-content">
          <span className="post-cat">{post.category}</span>

          <h2>{post.title}</h2>

          <p className="post-excerpt">
            {createExcerpt(post.content)}
          </p>
        </div>
      </Link>

      <div className="post-meta">
        <span className="author">{post.author}</span>

        <time dateTime={String(post.date)}>
          {formatDate(post.date)}
        </time>
      </div>
    </article>
  );
}