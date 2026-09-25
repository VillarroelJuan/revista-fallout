import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FALLOUT | Revista de ideas",
    template: "%s | FALLOUT",
  },

  description:
    "Crítica, análisis y conversaciones que importan. Revista independiente de política, cultura, tecnología, arte y más.",

  keywords: [
    "FALLOUT",
    "Revista Fallout",
    "revista",
    "política",
    "cultura",
    "tecnología",
    "arte",
    "Argentina",
  ],

  authors: [
    { name: "Juan Villarroel" },
    { name: "Exiliado Político" },
  ],

  creator: "FALLOUT",

  metadataBase: new URL("https://www.revistafallout.com"),

  openGraph: {
    title: "FALLOUT | Revista de ideas",
    description:
      "Crítica, análisis y conversaciones que importan.",
    url: "https://www.revistafallout.com",
    siteName: "FALLOUT",
    locale: "es_AR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "FALLOUT | Revista de ideas",
    description:
      "Crítica, análisis y conversaciones que importan.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}