import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";

type CategoryPageProps = {
  params: Promise<{
    categoria: string;
  }>;
};

const categories = [
  "Política",
  "Cultura",
  "Tecno",
  "Podcast",
  "Arte",
];

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { categoria } = await params;

  const decodedCategory = decodeURIComponent(categoria);
  const normalizedCategory = normalizeText(decodedCategory);

  const validCategory = categories.find(
    (item) => normalizeText(item) === normalizedCategory
  );

  if (!validCategory) {
    notFound();
  }

  const posts = getAllPosts().filter(
    (post) =>
      normalizeText(post.category) === normalizeText(validCategory)
  );

  return (
    <main className="container">
      <Header />

      <section className="category-page">
        <Link href="/" className="back-home">
          ← Todas las publicaciones
        </Link>

        <div className="category-header">
          <span className="category-label">CATEGORÍA</span>

          <h1>{validCategory}</h1>

          <p>
            {posts.length}{" "}
            {posts.length === 1 ? "publicación" : "publicaciones"}
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid-posts">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="empty-posts">
            <h2>Todavía no publicamos nada acá.</h2>
            <p>Próximamente habrá nuevas publicaciones.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}