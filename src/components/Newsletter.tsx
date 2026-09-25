"use client";

import { FormEvent, useState } from "react";

export default function Newsletter() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setSending(true);
    setMessage("");

    try {
      const response = await fetch("https://formspree.io/f/xwpqapdn", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setMessage("¡Gracias por suscribirte!");
        form.reset();
      } else {
        setMessage("Hubo un problema. Intentá nuevamente.");
      }
    } catch {
      setMessage("Hubo un problema. Intentá nuevamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="newsletter">
      <div>
        <span className="newsletter-label">NEWSLETTER</span>

        <h2>
          Que las noticias no
          <br />
          te tomen por sorpresa.
        </h2>

        <p>
          Recibí nuestras publicaciones y novedades directamente en tu correo.
        </p>
      </div>

      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="tu@email.com"
          required
        />

        <button type="submit" disabled={sending}>
          {sending ? "ENVIANDO..." : "SUSCRIBIRME"}
        </button>

        {message && <p className="newsletter-message">{message}</p>}
      </form>
    </section>
  );
}