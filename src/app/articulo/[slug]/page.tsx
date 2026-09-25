import type { Metadata } from "next";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { notFound } from "next/navigation";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(date: string | Date) {
  if (!date) return "";

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsedDate);
}

function createDescription(content: string, maxLength = 160) {
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

/* =========================
   SEO DINÁMICO
========================= */

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Artículo no encontrado",
    };
  }

  const description = createDescription(post.content);

  return {
    title: post.title,
    description,

    authors: [
      {
        name: post.author,
      },
    ],

    alternates: {
      canonical: `/articulo/${post.slug}`,
    },

    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `/articulo/${post.slug}`,
      siteName: "FALLOUT",

      images: post.image
        ? [
            {
              url: post.image,
              alt: post.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,

      images: post.image
        ? [post.image]
        : undefined,
    },
  };
}

/* =========================
   ARTÍCULOS ESTÁTICOS
========================= */

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({
    slug,
  }));
}

/* =========================
   PÁGINA DEL ARTÍCULO
========================= */

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;

  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="container">
      <Header />

      <article className="article-page">
        <Link href="/" className="back-home">
          ← Volver a publicaciones
        </Link>

        <header className="article-header">
          <span className="post-cat">{post.category}</span>

          <h1>{post.title}</h1>

          <div className="article-meta">
            <span>Por {post.author}</span>

            <span>•</span>

            <time dateTime={String(post.date)}>
              {formatDate(post.date)}
            </time>
          </div>
        </header>

        {post.image && (
          <figure className="article-cover">
            <img
              src={post.image}
              alt={`Portada de ${post.title}`}
            />
          </figure>
        )}

        <div className="article-content">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>

      <Footer />
    </main>
  );
}