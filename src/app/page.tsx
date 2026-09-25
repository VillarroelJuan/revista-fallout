import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PostCard from "@/components/PostCard";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import MomaArtwork from "@/components/MomaArtwork";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="container">
      <Header />

      <Hero />

      <div className="home-content-layout">

        <section className="posts-section">
          <div className="section-heading">
            <h2>Últimas publicaciones</h2>

            <span>
              {posts.length}{" "}
              {posts.length === 1
                ? "publicación"
                : "publicaciones"}
            </span>
          </div>

          {posts.length > 0 ? (
            <div className="grid-posts">
              {posts.map((post) => (
                <PostCard
                  key={post.slug}
                  post={post}
                />
              ))}
            </div>
          ) : (
            <div className="empty-posts">
              <p>No hay publicaciones todavía.</p>
            </div>
          )}
        </section>

        <div className="moma-sidebar">
          <MomaArtwork />
        </div>

      </div>

      <Newsletter />

      <Footer />
    </main>
  );
}