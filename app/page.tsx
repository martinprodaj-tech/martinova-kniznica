"use client";

import { useEffect, useMemo, useState } from "react";
import { books } from "./books";

type View = "shelf" | "archive";

function Stars({ rating }: { rating: number | null }) {
  const rounded = rating ? Math.round(rating) : 0;

  return (
    <div className="rating" aria-label={rating ? `${rating} z 5 hviezdičiek na Martinuse` : "Zatiaľ bez hodnotenia na Martinuse"}>
      <span className="stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span className={index < rounded ? "filled" : ""} key={index}>★</span>
        ))}
      </span>
      <span className="rating-copy">{rating ? `${rating.toFixed(1)} Martinus` : "bez hodnotenia"}</span>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("shelf");
  const [query, setQuery] = useState("");
  const [archived, setArchived] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("martin-books-archive") || "[]");
      if (Array.isArray(saved)) setArchived(saved);
    } finally {
      setReady(true);
    }
  }, []);

  const toggleArchive = (id: string) => {
    setArchived((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      localStorage.setItem("martin-books-archive", JSON.stringify(next));
      return next;
    });
  };

  const visibleBooks = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("sk");
    return books.filter((book) => {
      const isArchived = archived.includes(book.id);
      const inView = view === "archive" ? isArchived : !isArchived;
      const matches =
        !needle ||
        `${book.title} ${book.author}`.toLocaleLowerCase("sk").includes(needle);
      return inView && matches;
    });
  }, [archived, query, view]);

  const waiting = books.length - archived.length;

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Martinova knižnica — domov">
          <span className="brand-mark">MK</span>
          <span><strong>Martinova</strong><br />knižnica</span>
        </a>
        <div className="counter" aria-live="polite">
          <strong>{ready ? waiting : books.length}</strong>
          <span>kníh čaká<br />na prečítanie</span>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Súkromná zbierka · Google Keep · 2026</p>
          <h1>Knihy, ktoré<br /><em>čakajú.</em></h1>
          <p className="intro">
            Tituly odložené na správny okamih. Vyber si podľa obálky,
            autora alebo nálady — a prečítané knihy presuň do archívu.
          </p>
        </div>
        <div className="hero-still" aria-hidden="true">
          <span className="cup">☕</span>
          <span className="hero-book hero-book-one">myslieť</span>
          <span className="hero-book hero-book-two">objaviť</span>
          <span className="hero-book hero-book-three">čítať</span>
        </div>
      </section>

      <nav className="controls" aria-label="Ovládanie knižnice">
        <div className="tabs">
          <button className={view === "shelf" ? "active" : ""} onClick={() => setView("shelf")}>
            Na prečítanie <span>{ready ? waiting : books.length}</span>
          </button>
          <button className={view === "archive" ? "active" : ""} onClick={() => setView("archive")}>
            Prečítané <span>{ready ? archived.length : 0}</span>
          </button>
        </div>
        <label className="search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Hľadať knihu alebo autora"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Hľadať knihu alebo autora…"
            type="search"
            value={query}
          />
        </label>
      </nav>

      <section className="library" aria-live="polite">
        <div className="shelf-heading">
          <span>{view === "archive" ? "Archív" : "Polica 01"}</span>
          <span>{visibleBooks.length} titulov</span>
        </div>

        {visibleBooks.length ? (
          <div className="book-grid">
            {visibleBooks.map((book) => {
              const isArchived = archived.includes(book.id);
              return (
                <article className="book-card" key={book.id}>
                  <div className="cover-wrap">
                    <img src={book.cover} alt={`Obálka knihy ${book.title}`} />
                    <div className="cover-shine" />
                    <div className="cover-actions">
                      <a href={book.source} target="_blank" rel="noreferrer">Martinus ↗</a>
                      <button onClick={() => toggleArchive(book.id)}>
                        {isArchived ? "Vrátiť" : "Prečítané ✓"}
                      </button>
                    </div>
                  </div>
                  <div className="book-meta">
                    <p className="author">{book.author}</p>
                    <h2>{book.title}</h2>
                    <Stars rating={book.rating} />
                    <p className="description">{book.description}</p>
                    <button className="archive-button" onClick={() => toggleArchive(book.id)}>
                      {isArchived ? "↶ Vrátiť na policu" : "✓ Označiť ako prečítané"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty">
            <span aria-hidden="true">⌁</span>
            <h2>Táto polica je prázdna</h2>
            <p>{query ? "Skús iný názov alebo autora." : "Prečítané knihy tu zostanú bezpečne uložené."}</p>
          </div>
        )}
      </section>

      <footer>
        <span>Knihy z tvojho Google Keep</span>
        <span>Hodnotenia Martinus · aktualizované 30. 7. 2026</span>
      </footer>
    </main>
  );
}
