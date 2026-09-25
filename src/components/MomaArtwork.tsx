"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Artwork = {
  id: string;
  museum: string;
  title: string;
  artist: string;
  date: string;
  medium: string;
  image: string;
  url: string;
};

/* =========================================================
   CURADURÍA FALLOUT
========================================================= */

const ABSTRACT_TERMS = [
  "Jackson Pollock",
  "abstract",
  "abstract expressionism",
  "expressionism",
  "geometric abstraction",
  "modernism",
  "avant-garde",
  "surrealism",
  "experimental",
  "composition",
  "color field",
  "geometric",
];

const ARGENTINE_TERMS = [
  "Argentina",
  "Argentine",
  "Buenos Aires",
  "Xul Solar",
  "Antonio Berni",
  "Emilio Pettoruti",
  "Raquel Forner",
  "Lino Enea Spilimbergo",
  "Fernando Fader",
  "Benito Quinquela Martin",
  "Quinquela",
];

const MODERN_TERMS = [
  "modern art",
  "cubism",
  "fauvism",
  "surrealism",
  "expressionism",
  "avant-garde",
  "modernism",
  "experimental",
  "geometric",
];

const WILD_TERMS = [
  "painting",
  "landscape",
  "portrait",
  "night",
  "city",
  "sea",
  "dream",
  "woman",
  "man",
  "flowers",
  "nature",
];

/* =========================================================
   ELEGIR TIPO DE OBRA

   40% abstracto
   25% argentino
   20% moderno/vanguardia
   15% libre
========================================================= */

function getCuratedTerm(): string {
  const roll = Math.random();

  if (roll < 0.4) {
    return randomItem(ABSTRACT_TERMS);
  }

  if (roll < 0.65) {
    return randomItem(ARGENTINE_TERMS);
  }

  if (roll < 0.85) {
    return randomItem(MODERN_TERMS);
  }

  return randomItem(WILD_TERMS);
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

/* =========================================================
   PRECARGAR IMAGEN
========================================================= */

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();

    const timeout = window.setTimeout(() => {
      image.src = "";
      reject(new Error("Timeout"));
    }, 6000);

    image.onload = () => {
      window.clearTimeout(timeout);
      resolve();
    };

    image.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("Imagen no disponible"));
    };

    image.src = url;
  });
}

/* =========================================================
   1. THE MET — NEW YORK
========================================================= */

async function getMetArtwork(): Promise<Artwork> {
  const term = getCuratedTerm();

  const searchUrl =
    "https://collectionapi.metmuseum.org/public/collection/v1.1/search" +
    `?hasImages=true&q=${encodeURIComponent(term)}` +
    "&limit=100";

  const searchResponse = await fetch(searchUrl, {
    cache: "no-store",
  });

  if (!searchResponse.ok) {
    throw new Error("The Met");
  }

  const searchData = await searchResponse.json();

  const ids: number[] = searchData.objectIDs || [];

  if (ids.length === 0) {
    throw new Error("The Met sin resultados");
  }

  const candidates = shuffle(ids).slice(0, 15);

  for (const id of candidates) {
    try {
      const response = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        continue;
      }

      const item = await response.json();

      if (
        !item.isPublicDomain ||
        !item.primaryImageSmall
      ) {
        continue;
      }

      await preloadImage(item.primaryImageSmall);

      return {
        id: `met-${item.objectID}`,

        museum: "THE MET · NEW YORK",

        title:
          item.title ||
          "Sin título",

        artist:
          item.artistDisplayName ||
          "Artista desconocido",

        date:
          item.objectDate ||
          "Fecha desconocida",

        medium:
          item.medium || "",

        image:
          item.primaryImageSmall,

        url:
          item.objectURL,
      };
    } catch {
      continue;
    }
  }

  throw new Error("The Met sin obra válida");
}

/* =========================================================
   2. CLEVELAND MUSEUM OF ART
========================================================= */

async function getClevelandArtwork(): Promise<Artwork> {
  const term = getCuratedTerm();

  const response = await fetch(
    "https://openaccess-api.clevelandart.org/api/artworks/" +
      `?q=${encodeURIComponent(term)}` +
      "&has_image=1" +
      "&cc0=true" +
      "&limit=100",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Cleveland");
  }

  const result = await response.json();

  const works = shuffle(result.data || []);

  for (const item of works) {
    try {
      const image =
        item.images?.web?.url ||
        item.images?.print?.url;

      if (!image || !item.title) {
        continue;
      }

      await preloadImage(image);

      const creator =
        item.creators?.[0]?.description ||
        item.creators?.[0]?.name ||
        "Artista desconocido";

      return {
        id: `cleveland-${item.id}`,

        museum:
          "CLEVELAND MUSEUM OF ART",

        title:
          item.title ||
          "Sin título",

        artist:
          creator,

        date:
          item.creation_date ||
          "Fecha desconocida",

        medium:
          item.technique ||
          item.type ||
          "",

        image,

        url:
          item.url ||
          `https://www.clevelandart.org/art/${item.accession_number}`,
      };
    } catch {
      continue;
    }
  }

  throw new Error("Cleveland sin obra válida");
}

/* =========================================================
   3. VICTORIA & ALBERT MUSEUM — LONDON
========================================================= */

async function getVAMArtwork(): Promise<Artwork> {
  const term = getCuratedTerm();

  const response = await fetch(
    "https://api.vam.ac.uk/v2/objects/search" +
      `?q=${encodeURIComponent(term)}` +
      "&images_exist=true" +
      "&page_size=50",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("V&A");
  }

  const result = await response.json();

  const works = shuffle(result.records || []);

  if (works.length === 0) {
    throw new Error("V&A sin resultados");
  }

  for (const item of works) {
    try {
      const imageId =
        item._primaryImageId;

      if (!imageId) {
        continue;
      }

      /*
       * Imagen IIIF del V&A
       */

      const image =
        `https://framemark.vam.ac.uk/collections/${imageId}/full/735,/0/default.jpg`;

      /*
       * No mostramos la obra hasta comprobar
       * que la imagen funciona.
       */

      await preloadImage(image);

      const title =
        item._primaryTitle ||
        item.objectType ||
        "Sin título";

      let artist =
        "Artista desconocido";

      if (
        typeof item._primaryMaker ===
        "string"
      ) {
        artist =
          item._primaryMaker;
      } else if (
        item._primaryMaker?.name
      ) {
        artist =
          item._primaryMaker.name;
      }

      const date =
        item._primaryDate ||
        "Fecha desconocida";

      const systemNumber =
        item.systemNumber ||
        "";

      return {
        id:
          `vam-${systemNumber || imageId}`,

        museum:
          "VICTORIA & ALBERT MUSEUM · LONDON",

        title,

        artist,

        date,

        medium:
          item.objectType ||
          "",

        image,

        url:
          systemNumber
            ? `https://collections.vam.ac.uk/item/${systemNumber}/`
            : "https://collections.vam.ac.uk/",
      };
    } catch {
      /*
       * Si una imagen falla,
       * buscamos otra.
       */
      continue;
    }
  }

  throw new Error(
    "V&A sin obra válida"
  );
}

/* =========================================================
   MUSEOS ACTIVOS

   Solamente:
   1. THE MET
   2. CLEVELAND
   3. V&A
========================================================= */

const museumSources = [
  getMetArtwork,
  getClevelandArtwork,
  getVAMArtwork,
];

/* =========================================================
   BUSCAR OBRA
========================================================= */

async function getRandomArtwork(
  avoidId?: string
): Promise<Artwork> {
  /*
   * Mezclamos los museos para que
   * cualquiera pueda aparecer.
   */

  const sources =
    shuffle(museumSources);

  for (const source of sources) {
    try {
      const artwork =
        await source();

      if (
        artwork &&
        artwork.image &&
        artwork.id !== avoidId
      ) {
        return artwork;
      }
    } catch {
      /*
       * Si un museo falla,
       * probamos automáticamente otro.
       */
      continue;
    }
  }

  throw new Error(
    "No se encontró una obra"
  );
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function MomaArtwork() {
  const [artwork, setArtwork] =
    useState<Artwork | null>(null);

  /*
   * Acá guardamos la próxima obra.
   *
   * Ya está descargada antes de que
   * el usuario toque CAMBIAR.
   */

  const nextArtworkRef =
    useRef<Artwork | null>(null);

  const preparingRef =
    useRef(false);

  const [loading, setLoading] =
    useState(true);

  const [nextReady, setNextReady] =
    useState(false);

  const [error, setError] =
    useState(false);

  /* =======================================================
     PREPARAR PRÓXIMA OBRA
  ======================================================= */

  const prepareNextArtwork =
    useCallback(
      async (
        currentId?: string
      ) => {
        if (
          preparingRef.current
        ) {
          return;
        }

        preparingRef.current =
          true;

        setNextReady(false);

        try {
          const next =
            await getRandomArtwork(
              currentId
            );

          nextArtworkRef.current =
            next;

          setNextReady(true);
        } catch {
          nextArtworkRef.current =
            null;

          setNextReady(false);
        } finally {
          preparingRef.current =
            false;
        }
      },
      []
    );

  /* =======================================================
     PRIMERA OBRA
  ======================================================= */

  const loadFirstArtwork =
    useCallback(async () => {
      try {
        setLoading(true);

        setError(false);

        const first =
          await getRandomArtwork();

        setArtwork(first);

        /*
         * Apenas mostramos la primera obra,
         * preparamos la siguiente.
         */

        window.setTimeout(() => {
          prepareNextArtwork(
            first.id
          );
        }, 100);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, [prepareNextArtwork]);

  /* =======================================================
     CAMBIAR OBRA
  ======================================================= */

  const changeArtwork =
    useCallback(async () => {
      /*
       * Si ya tenemos una obra preparada:
       *
       * CAMBIO INSTANTÁNEO.
       */

      if (
        nextArtworkRef.current
      ) {
        const next =
          nextArtworkRef.current;

        nextArtworkRef.current =
          null;

        setNextReady(false);

        setArtwork(next);

        /*
         * Inmediatamente empezamos
         * a preparar otra.
         */

        window.setTimeout(() => {
          prepareNextArtwork(
            next.id
          );
        }, 100);

        return;
      }

      /*
       * Si todavía estamos preparando
       * la siguiente, esperamos.
       */

      if (
        preparingRef.current
      ) {
        return;
      }

      /*
       * Fallback:
       *
       * si por alguna razón no había una
       * obra preparada, buscamos una ahora.
       */

      try {
        setLoading(true);

        const next =
          await getRandomArtwork(
            artwork?.id
          );

        setArtwork(next);

        window.setTimeout(() => {
          prepareNextArtwork(
            next.id
          );
        }, 100);
      } catch {
        /*
         * Si falla mantenemos
         * la obra actual.
         */
      } finally {
        setLoading(false);
      }
    }, [
      artwork,
      prepareNextArtwork,
    ]);

  /* =======================================================
     CARGA INICIAL
  ======================================================= */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        loadFirstArtwork();
      }, 0);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [loadFirstArtwork]);

  /* =======================================================
     CAMBIO AUTOMÁTICO

     45 segundos
  ======================================================= */

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        changeArtwork();
      }, 45000);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [changeArtwork]);

  /* =======================================================
     CARGANDO
  ======================================================= */

  if (
    loading &&
    !artwork
  ) {
    return (
      <aside className="moma-widget">

        <div className="moma-widget-top">

          <span>
            ARTE QUE RECOMENDAMOS
          </span>

          <span className="moma-dot">
            ●
          </span>

        </div>

        <div className="moma-loading">
          CARGANDO OBRA...
        </div>

      </aside>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error &&
    !artwork
  ) {
    return (
      <aside className="moma-widget">

        <div className="moma-widget-top">

          <span>
            ARTE QUE RECOMENDAMOS
          </span>

          <span className="moma-dot">
            ●
          </span>

        </div>

        <div className="moma-loading">

          <button
            type="button"
            onClick={
              loadFirstArtwork
            }
            className="moma-refresh"
          >
            REINTENTAR ↻
          </button>

        </div>

      </aside>
    );
  }

  if (!artwork) {
    return null;
  }

  /* =======================================================
     WIDGET
  ======================================================= */

  return (
    <aside className="moma-widget">

      {/* CABECERA */}

      <div className="moma-widget-top">

        <span>
          ARTE QUE RECOMENDAMOS
        </span>

        <span className="moma-dot">
          ●
        </span>

      </div>


      {/* IMAGEN */}

      <div className="moma-artwork-image">

        <img
          key={artwork.id}
          src={artwork.image}
          alt={artwork.title}
          loading="eager"
        />

      </div>


      {/* INFORMACIÓN */}

      <div className="moma-info">

        <span className="moma-source">
          {artwork.museum}
        </span>

        <h2>
          {artwork.title}
        </h2>

        <p className="moma-artist">
          {artwork.artist}
        </p>

        <p className="moma-date">
          {artwork.date}
        </p>

        <div className="moma-line" />

        {artwork.medium && (
          <p className="moma-medium">
            {artwork.medium}
          </p>
        )}

        <a
          href={artwork.url}
          target="_blank"
          rel="noopener noreferrer"
          className="moma-link"
        >
          VER OBRA ↗
        </a>

      </div>


      {/* FOOTER */}

      <div className="moma-widget-footer">

        <span>
          ENTENDEMOS LO QUE TE GUSTA
        </span>

        <button
          type="button"
          onClick={
            changeArtwork
          }
          disabled={
            loading ||
            (!nextReady &&
              preparingRef.current)
          }
          className="moma-refresh"
        >
          {nextReady
            ? "CAMBIAR ↻"
            : "PREPARANDO..."}
        </button>

      </div>

    </aside>
  );
}