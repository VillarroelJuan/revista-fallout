"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactoPage() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setSending(true);
    setStatus("");

    try {
      const response = await fetch("https://formspree.io/f/mqkgazkp", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setStatus("✅ Mensaje enviado. ¡Gracias por contactarnos!");
        form.reset();
      } else {
        setStatus("❌ Hubo un error. Intentá nuevamente.");
      }
    } catch {
      setStatus("❌ Hubo un error. Intentá nuevamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="container">
      <Header />

      <section className="contact-page">
        <Link href="/" className="back-home">
          ← Volver al inicio
        </Link>

        <div className="contact-header">
          <span>CONTACTO</span>

          <h1>
            Hablemos<span>.</span>
          </h1>

          <p>
            ¿Querés escribirnos, colaborar con FALLOUT o simplemente
            mandarnos algo? Dejanos tu mensaje.
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-field">
            <label htmlFor="name">Tu nombre</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Nombre"
              required
            />
          </div>

          <div className="contact-field">
            <label htmlFor="email">Tu email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="contact-field contact-field-full">
            <label htmlFor="subject">Asunto</label>
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="¿Sobre qué querés hablar?"
              required
            />
          </div>

          <div className="contact-field contact-field-full">
            <label htmlFor="message">Mensaje</label>
            <textarea
              id="message"
              name="message"
              placeholder="Escribí tu mensaje..."
              required
            />
          </div>

          <div className="contact-field-full">
            <button
              className="contact-submit"
              type="submit"
              disabled={sending}
            >
              {sending ? "ENVIANDO..." : "ENVIAR MENSAJE →"}
            </button>

            {status && <p className="contact-status">{status}</p>}
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}