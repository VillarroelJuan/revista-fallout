import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <span className="footer-logo">FALLOUT</span>
        {" · Revista colaborativa"}
      </div>

      <div className="footer-links">
        <a
          href="https://www.instagram.com/exiliadopolitico/"
          target="_blank"
          rel="noopener noreferrer"
        >
          📸 Exiliado Político
        </a>

        <a
          href="https://www.instagram.com/juanmaavilla/"
          target="_blank"
          rel="noopener noreferrer"
        >
          📸 Juan Villarroel
        </a>

        <a
          href="https://x.com/RevistaFallout"
          target="_blank"
          rel="noopener noreferrer"
        >
          𝕏 Nuestro X
        </a>

        <Link href="/contacto">
          ✉️ Contacto
        </Link>
      </div>
    </footer>
  );
}