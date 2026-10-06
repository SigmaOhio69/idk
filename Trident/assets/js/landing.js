/* ============================================================================
   Trident — landing page behaviour
   - builds the hero grid (35 x 22 dashed cells, verbatim geometry)
   - mounts the six bento illustrations rendered from the reference source
   - builds the provider catalogue and the FAQ accordion
   - wires scroll reveals and in-page anchors
   ========================================================================== */
(function () {
  const T = (window.Trident = window.Trident || {});
  const I = T.icon;
  const D = T.data;
  const ART = T.art || {};

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (id) => document.getElementById(id);
  const html = (node, markup) => {
    if (node) node.innerHTML = markup;
  };
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ── Hero grid (hero-section.tsx: 35 cols x 22 rows, step 36) ─────────── */
  function paintHeroGrid() {
    const host = el("lHeroGrid");
    if (!host) return;
    let out = "";
    for (let r = 0; r < 22; r++) {
      const y = (9.2 + r * 36).toFixed(1);
      for (let i = 0; i < 35; i++) {
        const x = (-20.0891 + i * 36).toFixed(4);
        out +=
          `<rect x="${x}" y="${y}" width="35.6" height="35.6" ` +
          `style="stroke:hsl(var(--foreground));stroke-opacity:0.11" ` +
          `stroke-width="0.4" stroke-dasharray="2 2"/>`;
      }
    }
    host.innerHTML = out;
  }

  /* ── Counting copy ────────────────────────────────────────────────────── */
  const ONES = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
    "eighteen", "nineteen",
  ];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function words(n) {
    if (n < 20) return ONES[n];
    if (n < 100) {
      const t = Math.floor(n / 10);
      const o = n % 10;
      return TENS[t] + (o ? "-" + ONES[o] : "");
    }
    return String(n);
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function paintCounts() {
    if (!D || !D.PROVIDERS) return;
    const providers = D.PROVIDERS.length;
    const models = D.PROVIDERS.reduce((n, p) => n + (p.models ? p.models.length : 0), 0);
    const head = el("lModelsHead");
    if (head) head.textContent = `${cap(words(models))} models, ${words(providers)} providers.`;
  }

  /* ── Bento (bento-section.tsx structure + real illustrations) ─────────── */
  const CARDS = [
    { art: "aiCodeReviews", title: "Frontier code generation.", desc: "Compare code across Claude 3.5 Sonnet, GPT-5.1, and DeepSeek." },
    { art: "realTimePreviews", title: "Real-time token streaming.", desc: "Watch tokens land instantly with clean blur reveals and syntax highlighting." },
    { art: "oneClickIntegrations", title: "One-click tool integrations.", desc: "Connect repositories, APIs, and workflows directly to your conversations." },
    { art: "mcpConnectivity", title: "Model Context Protocol.", desc: "Equip any model with external servers and custom tools via MCP." },
    { art: "parallelAgents", title: "Multi-model comparison.", desc: "Fan one prompt out to multiple providers and evaluate answers side-by-side." },
    { art: "easyDeployment", title: "Automated build logs.", desc: "Inspect execution output, compile diagnostics, and error traces in one thread." },
  ];

  function paintBento() {
    const host = el("lBento");
    if (!host) return;
    host.innerHTML = CARDS.map(
      (c) =>
        `<article class="l-card reveal">
           <div class="l-card__text">
             <p><span class="l-card__title">${esc(c.title)}</span><span class="l-card__desc">${esc(
          c.desc
        )}</span></p>
           </div>
           <div class="l-card__art">${ART[c.art] || ""}</div>
         </article>`
    ).join("");
  }

  /** Catalogue rows deep-link into the app with that model pre-selected. */
  function bindCatalogue() {
    const host = el("lModelGrid");
    if (!host) return;
    host.addEventListener("click", (e) => {
      const row = e.target.closest("[data-model]");
      if (!row) return;
      const id = row.getAttribute("data-model");
      U.store.set({ model: id });
      if (U.store.state.user) {
        T.app.enterApp();
      } else {
        T.app.showAuth("signup");
      }
    });
  }

  /* ── Provider catalogue ───────────────────────────────────────────────── */
  function paintCatalogue() {
    const host = el("lModelGrid");
    if (!host || !D || !D.PROVIDERS) return;
    host.innerHTML = D.PROVIDERS.map((p) => {
      const models = p.models
        .map(
          (m) =>
            `<div class="l-model" data-model="${esc(m.id)}" role="button" tabindex="0">
               <div class="l-model__name">${esc(m.name)}</div>
               <div class="l-model__desc">${esc(m.desc)}</div>
               ${
                 m.tags && m.tags.length
                   ? '<div class="l-model__tags">' +
                     m.tags
                       .map(
                         (t) =>
                           `<span class="l-tag">${I.ui(t.icon || "spark", 11, 1.8)}<span>${esc(t.label)}</span></span>`
                       )
                       .join("") +
                     "</div>"
                   : ""
               }
             </div>`
        )
        .join("");
      return (
        `<article class="l-provider">
           <div class="l-provider__head">
             <span class="l-provider__logo">${I.logo(p.logo, 17)}</span>
             <div><b>${esc(p.name)}</b><em>${esc(p.sub || "")}</em></div>
             <span class="l-provider__count">${p.models.length}</span>
           </div>
           <div>${models}</div>
         </article>`
      );
    }).join("");
  }

  /* ── FAQ ──────────────────────────────────────────────────────────────── */
  const FAQ = [
    {
      q: "What is Trident and who is it for?",
      a: "Trident is a single chat surface that sits in front of every major model provider. It is built for people who switch models on purpose — comparing answers, escalating a hard problem to a stronger model, or dropping to a fast one for a quick rewrite.",
    },
    {
      q: "How does the model picker work?",
      a: "Pick a provider, then a model. Capability tags travel with the thread, so you can see context window, reasoning, vision, code and cost before you commit. Pin the models you use most to the top of the list.",
    },
    {
      q: "Can I run one prompt across several models?",
      a: "Yes. Fan a single prompt out to any set of models and read the answers in parallel columns. It is the fastest way to find out whether a disagreement is about the model or about the prompt.",
    },
    {
      q: "What happens to my threads between sessions?",
      a: "Threads persist locally — every message, every route change and every model swap. Reopen a thread and it resumes exactly where you left it, including the provider that answered last.",
    },
    {
      q: "Does it support MCP servers?",
      a: "MCP servers are configured per workspace, so tools can be scoped to a project rather than to the account. Server access is managed from the workspace settings panel.",
    },
    {
      q: "Is streaming supported?",
      a: "Responses stream token by token with full markdown rendering — fenced code blocks, tables, lists and inline code — plus one-click copy on every block.",
    },
  ];

  function paintFaq() {
    const host = el("lFaq");
    if (!host) return;
    host.innerHTML = FAQ.map(
      (f, i) =>
        `<div class="l-faq__item" data-i="${i}">
           <button class="l-faq__q" type="button" aria-expanded="false">
             <span>${esc(f.q)}</span>
             <span class="l-faq__chev">${I.ui("chevronDown", 24, 1.9)}</span>
           </button>
           <div class="l-faq__a"><div><p>${esc(f.a)}</p></div></div>
         </div>`
    ).join("");

    host.addEventListener("click", (e) => {
      const btn = e.target.closest(".l-faq__q");
      if (!btn) return;
      const item = btn.closest(".l-faq__item");
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function paintFooterSocial() {
    const host = el("lFootSocial");
    if (!host) return;
    const items = [
      ["twitter", "X"],
      ["github", "GitHub"],
      ["linkedin", "LinkedIn"],
    ];
    host.innerHTML = items
      .map(([name, label]) => `<a href="#" aria-label="${label}">${I.ui(name, 16, 1.7)}</a>`)
      .join("");
  }

  /* ── Reveal + anchors ─────────────────────────────────────────────────── */
  function initReveal(scope) {
    const nodes = Array.prototype.slice.call((scope || document).querySelectorAll(".reveal"));
    if (!nodes.length) return;
    if (REDUCED || !("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    nodes.forEach((n) => {
      const sibs = Array.prototype.slice.call(n.parentElement ? n.parentElement.children : []);
      n.style.setProperty("--rd", Math.min(sibs.indexOf(n), 5) * 70 + "ms");
      io.observe(n);
    });
  }

  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 40,
          behavior: REDUCED ? "auto" : "smooth",
        });
      });
    });
  }

  /* ── Boot ─────────────────────────────────────────────────────────────── */
  function boot() {
    paintHeroGrid();
    paintCounts();
    paintBento();
    paintCatalogue();
    paintFaq();
    paintFooterSocial();
    bindCatalogue();
    initReveal();
    initAnchors();

    // Open the first FAQ item so the section never reads as empty.
    const first = document.querySelector(".l-faq__q");
    if (first) first.click();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
