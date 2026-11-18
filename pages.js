const ARCHIVE_KEY = "martin-books-archive";

const state = {
  books: [],
  archived: new Set(JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]")),
  query: "",
  view: "unread",
};

const shelf = document.querySelector("#shelf");
const empty = document.querySelector("#empty");
const search = document.querySelector("#search");
const tabs = [...document.querySelectorAll(".tab")];
const visibleCount = document.querySelector("#visible-count");
const totalCount = document.querySelector("#total-count");
const readCount = document.querySelector("#read-count");

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function coverPath(path) {
  return `./public${path}`;
}

function ratingMarkup(rating) {
  if (rating == null) {
    return `<span class="stars" aria-label="Bez hodnotenia">☆☆☆☆☆</span><span>bez hodnotenia</span>`;
  }
  const full = Math.round(rating);
  const stars = "★".repeat(full) + "☆".repeat(5 - full);
  return `<span class="stars" aria-label="${rating} z 5">${stars}</span><span>${rating.toFixed(1)} / 5</span>`;
}

// Najnovšie knihy hore + štítok NOVÁ 14 dní (Martin [TG] 2026-11-18: „Zmeň teda poradie.“)
const NEW_DAYS = 14;
function isNew(book) {
  if (!book.receivedAt) return false;
  const t = Date.parse(book.receivedAt);
  return !Number.isNaN(t) && Date.now() - t < NEW_DAYS * 864e5;
}
function newestFirst(books) {
  // books.json je v poradí pridania (nové na konci) → otočiť; knihy s receivedAt zoradiť podľa času
  return books
    .map((book, index) => ({ book, index }))
    .sort((a, b) => {
      const ta = Date.parse(a.book.receivedAt || "") || 0;
      const tb = Date.parse(b.book.receivedAt || "") || 0;
      return tb - ta || b.index - a.index;
    })
    .map((item) => item.book);
}

function renderBook(book) {
  const archived = state.archived.has(book.id);
  return `
    <article class="book">
      <div class="cover-wrap">
        <img class="cover" src="${coverPath(book.cover)}" alt="Obálka knihy ${escapeHtml(book.title)}" loading="lazy" />
      </div>
      <div class="book__body">
        ${isNew(book) ? '<span class="new-badge" style="align-self:flex-start;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:#d9480f;color:#fff;font-size:.72rem;font-weight:700;letter-spacing:.04em">NOVÁ</span>' : ""}
        <h2>${escapeHtml(book.title)}</h2>
        <p class="author">${escapeHtml(book.author)}</p>
        <p class="description">${escapeHtml(book.description)}</p>
        <div class="rating">${ratingMarkup(book.rating)}</div>
        <div class="actions">
          <a href="${escapeHtml(book.source)}" target="_blank" rel="noreferrer">Martinus</a>
          <button class="archive" data-id="${escapeHtml(book.id)}" title="${archived ? "Vrátiť na poličku" : "Označiť ako prečítané"}" aria-label="${archived ? "Vrátiť na poličku" : "Označiť ako prečítané"}">
            ${archived ? "↩" : "✓"}
          </button>
        </div>
      </div>
    </article>`;
}

function render() {
  const needle = state.query.trim().toLocaleLowerCase("sk");
  const filtered = state.books.filter((book) => {
    const isArchived = state.archived.has(book.id);
    const inView = state.view === "read" ? isArchived : !isArchived;
    const matches = !needle || `${book.title} ${book.author}`.toLocaleLowerCase("sk").includes(needle);
    return inView && matches;
  });

  shelf.innerHTML = filtered.map(renderBook).join("");
  empty.hidden = filtered.length > 0;
  visibleCount.textContent = filtered.length;
  totalCount.textContent = state.books.length;
  readCount.textContent = state.archived.size;
}

search.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.view = tab.dataset.view;
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    render();
  });
});

shelf.addEventListener("click", (event) => {
  const button = event.target.closest(".archive");
  if (!button) return;
  const id = button.dataset.id;
  if (state.archived.has(id)) state.archived.delete(id);
  else state.archived.add(id);
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify([...state.archived]));
  render();
});

fetch("./books.json?v=116")
  .then((response) => {
    if (!response.ok) throw new Error("Nepodarilo sa načítať zoznam kníh.");
    return response.json();
  })
  .then((books) => {
    state.books = newestFirst(books);
    render();
  })
  .catch((error) => {
    empty.hidden = false;
    empty.textContent = error.message;
  });
