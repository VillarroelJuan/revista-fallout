    import Link from "next/link";

const categories = ["Política", "Cultura", "Tecno", "Podcast", "Arte"];

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="logo">
        FALLOUT<span>.</span>
        <small>Revista de ideas · Edición colaborativa</small>
      </Link>

      <nav className="main-nav">
        <Link href="/">Todos</Link>

        {categories.map((category) => (
          <Link
            key={category}
            href={`/categoria/${encodeURIComponent(category.toLowerCase())}`}
          >
            {category}
          </Link>
        ))}
      </nav>
    </header>
  );
}