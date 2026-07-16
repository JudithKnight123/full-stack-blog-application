let categories = [];
let films = [];
let currentFilter = "all";
let editingCategoryId = null;
let editingFilmId = null;

function ordinal(n){
  const s = ["th","st","nd","rd"], v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}
function formatDate(iso){
  if(!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if(isNaN(d)) return iso;
  const wd = d.toLocaleDateString("en-GB", { weekday:"short" });
  const month = d.toLocaleDateString("en-GB", { month:"short" });
  return `${wd} ${ordinal(d.getDate())} ${month}`;
}
function shortDate(iso){
  if(!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if(isNaN(d)) return iso;
  return `${d.getDate()} ${d.toLocaleDateString("en-GB",{month:"short"})}`;
}
function escapeHtml(str){
  return (str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}
function getCategory(id){ return categories.find(c => c.id === id); }

document.querySelectorAll(".lightbox-trigger").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById(btn.dataset.target).classList.add("is-open");
  });
});
document.querySelectorAll(".lightbox-close").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById(btn.dataset.target).classList.remove("is-open");
  });
});

function renderAll(){
  renderTabs();
  renderCategoryStrap();
  renderGrid();
  renderCuratorUI();
}

function renderTabs(){
  const tabs = document.getElementById("tabs");
  let html = `<button class="tab ${currentFilter === "all" ? "active" : ""}" data-filter="all" style="--dot:var(--ink-soft)">All screenings</button>`;
  categories.forEach(cat => {
    html += `<button class="tab ${currentFilter === cat.id ? "active" : ""}" data-filter="${cat.id}" style="--dot:${cat.color}">${escapeHtml(cat.name)}</button>`;
  });
  tabs.innerHTML = html;
  tabs.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => { currentFilter = btn.dataset.filter; renderAll(); });
  });
}

function renderCategoryStrap(){
  const strap = document.getElementById("categoryStrap");
  if(currentFilter === "all"){ strap.style.display = "none"; strap.innerHTML = ""; return; }
  const cat = getCategory(currentFilter);
  if(!cat){ strap.style.display = "none"; return; }
  strap.style.display = "flex";
  strap.innerHTML = `
    <div>
      <h2>${escapeHtml(cat.name)}</h2>
      <p>${escapeHtml(cat.description || "")}</p>
    </div>
    <div class="mono" style="color:var(--ink-soft); font-size:0.85rem; text-align:right;">
      ${escapeHtml(cat.schedule || "")}${cat.programmer ? "<br>Programmed by " + escapeHtml(cat.programmer) : ""}
    </div>`;
}

function posterInnerHtml(film, cat){
  if(film.image) return "";
  const color = cat ? cat.color : "#6e8f5c";
  const onColor = cat ? cat.onColor : "#f7f4e9";
  return `
    <div class="poster-generated" style="background:${color}; color:${onColor};">
      <span class="poster-eyebrow">${escapeHtml(cat ? cat.name : "")}</span>
      <span class="poster-title">${escapeHtml(film.title)}</span>
    </div>`;
}

function renderGrid(){
  const grid = document.getElementById("grid");
  let list = [...films];
  if(currentFilter !== "all") list = list.filter(f => f.categoryId === currentFilter);
  list.sort((a,b) => (a.date || "").localeCompare(b.date || ""));

  if(list.length === 0){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">No screenings here yet.</div>`;
    return;
  }

  grid.innerHTML = list.map(film => {
    const cat = getCategory(film.categoryId);
    const bg = film.image ? `style="background-image:url('${escapeHtml(film.image)}')"` : "";
    return `
    <article class="poster-card" data-id="${film.id}">
      <button class="poster-visual" data-open="${film.id}" ${bg} aria-label="View details for ${escapeHtml(film.title)}">
        ${posterInnerHtml(film, cat)}
        <span class="date-tab">${shortDate(film.date)}</span>
        ${film.certificate ? `<span class="cert-badge">${escapeHtml(film.certificate)}</span>` : ""}
      </button>
      <div class="poster-meta">
        <h3>${escapeHtml(film.title)}</h3>
        <p class="meta-line">${[film.genre, film.runtime, film.country, film.year].filter(Boolean).join(" · ")}</p>
      </div>
      <div class="card-actions curator-only hidden">
        <button class="btn btn-small" data-edit="${film.id}">✎ Edit</button>
        <button class="btn btn-small btn-crimson" data-delete="${film.id}">🗑 Delete</button>
      </div>
    </article>`;
  }).join("");

  grid.querySelectorAll("[data-open]").forEach(btn => btn.addEventListener("click", () => openDetail(btn.dataset.open)));
  grid.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => openFilmEditor(btn.dataset.edit)));
  grid.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => {
    deleteFilm(btn.dataset.delete);
  }));

  document.querySelectorAll(".curator-only").forEach(el => {
    el.classList.toggle("hidden", !token);
  });
}

function renderCuratorUI(){
  document.getElementById("curatorAddFilmBtn").classList.toggle("hidden", !token);
  document.querySelectorAll(".curator-only").forEach(el => {
    el.classList.toggle("hidden", !token);
  });
}

function openDetail(filmId){
  const film = films.find(f => f.id === filmId);
  if(!film) return;
  const cat = getCategory(film.categoryId);
  const content = document.getElementById("detailContent");
  const bg = film.image ? `style="background-image:url('${escapeHtml(film.image)}')"` : "";
  content.innerHTML = `
    <div class="detail-visual">
      <div class="poster-visual" ${bg}>${film.image ? "" : posterInnerHtml(film, cat)}</div>
    </div>
    <div class="detail-body">
      <span class="cat-chip" style="background:${cat ? cat.color : "#6e8f5c"}; color:${cat ? cat.onColor : "#fff"}">${escapeHtml(cat ? cat.name : "")}</span>
      <h2>${escapeHtml(film.title)}</h2>
      <div class="detail-meta">
        <span>${formatDate(film.date)}</span>
        ${film.certificate ? `<span>Cert ${escapeHtml(film.certificate)}</span>` : ""}
        ${[film.genre, film.runtime, film.country, film.year].filter(Boolean).map(escapeHtml).join(" · ")}
      </div>
      ${film.hint ? `<p class="detail-hint">${escapeHtml(film.hint)}</p>` : ""}
      <p>${escapeHtml(film.synopsis)}</p>
    </div>`;
  document.getElementById("detailOverlay").classList.add("is-open");
}

function openCategoryEditor(catId){
  editingCategoryId = catId;
  const form = document.getElementById("categoryEditForm");
  form.reset();
  if(catId){
    const cat = getCategory(catId);
    document.getElementById("categoryEditTitle").textContent = "Edit category";
    document.getElementById("catName").value = cat.name || "";
    document.getElementById("catColor").value = cat.color || "#6e8f5c";
    document.getElementById("catSchedule").value = cat.schedule || "";
    document.getElementById("catProgrammer").value = cat.programmer || "";
    document.getElementById("catDescription").value = cat.description || "";
    document.getElementById("catDeleteBtn").style.display = "inline-block";
  } else {
    document.getElementById("categoryEditTitle").textContent = "Add category";
    document.getElementById("catDeleteBtn").style.display = "none";
  }
  document.getElementById("categoryEditOverlay").classList.add("is-open");
}
document.getElementById("addCategoryBtn").addEventListener("click", () => openCategoryEditor(null));

function openFilmEditor(filmId){
  editingFilmId = filmId;
  const form = document.getElementById("filmEditForm");
  form.reset();
  const catSelect = document.getElementById("filmCategory");
  catSelect.innerHTML = categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  if(filmId){
    const film = films.find(f => f.id === filmId);
    document.getElementById("filmEditTitle").textContent = "Edit film";
    document.getElementById("filmTitle").value = film.title || "";
    catSelect.value = film.categoryId || "";
    document.getElementById("filmDate").value = film.date || "";
    document.getElementById("filmCert").value = film.certificate || "15";
    document.getElementById("filmGenre").value = film.genre || "";
    document.getElementById("filmRuntime").value = film.runtime || "";
    document.getElementById("filmCountry").value = film.country || "";
    document.getElementById("filmYear").value = film.year || "";
    document.getElementById("filmImage").value = film.image || "";
    document.getElementById("filmHint").value = film.hint || "";
    document.getElementById("filmSynopsis").value = film.synopsis || "";
    document.getElementById("filmDeleteBtn").style.display = "inline-block";
  } else {
    document.getElementById("filmEditTitle").textContent = "Add film";
    document.getElementById("filmDeleteBtn").style.display = "none";
  }
  document.getElementById("filmOverlay").classList.add("is-open");
}
document.getElementById("curatorAddFilmBtn").addEventListener("click", () => openFilmEditor(null));
document.getElementById("filmImage").addEventListener("input", e => {
  document.getElementById("filmImagePreview").style.backgroundImage = e.target.value ? `url('${e.target.value}')` : "";
});
