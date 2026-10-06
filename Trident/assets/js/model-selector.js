/* ============================================================================
   Trident — fluid model picker
   Provider column with a spring-driven hover pill; clicking (or hovering) a
   provider expands the nested model column. Keyboard navigable, searchable,
   with pinned favourites persisted to the store.
   ========================================================================== */
(function () {
  const T = (window.Trident = window.Trident || {});
  const U = T.ui;
  const I = T.icon;
  const esc = U.escape;

  const ROW_H = 40;

  const picker = {
    host: null,
    trigger: null,
    portal: null,
    panel: null,
    open: false,
    query: "",
    active: 0, // index into visible rows
    expanded: null, // index of the row whose models are shown inline
    focusModels: false,
    modelIndex: 0,
    rows: [],
    visible: [],
    pill: null,
    pillSpring: null,
    onChange: null,
  };

  /* ── Model resolution ─────────────────────────────────────────────────── */
  function current() {
    const id = U.store.state.model || T.data.DEFAULT_MODEL;
    return T.data.findModel(id);
  }

  function setModel(id) {
    const found = T.data.findModel(id);
    U.store.set({ model: found.model.id });
    renderTrigger();
    if (picker.onChange) picker.onChange(found);
  }

  function pinned() {
    return U.store.state.pinned || [];
  }

  function togglePin(id) {
    const list = pinned().slice();
    const i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1);
    else list.push(id);
    U.store.set({ pinned: list });
    renderModels();
    renderRows();
  }

  /* ── Row model ────────────────────────────────────────────────────────── */
  function buildRows() {
    const q = picker.query.trim().toLowerCase();
    const rows = [];

    const favs = pinned()
      .map((id) => T.data.findModel(id))
      .filter(Boolean);
    if (favs.length && !q) {
      rows.push({
        id: "__fav",
        name: "Favourites",
        sub: favs.length + " pinned",
        logo: null,
        color: "var(--warning)",
        models: favs.map((f) => f.model),
      });
    }

    T.data.PROVIDERS.forEach((p) => {
      let models = p.models;
      if (q) {
        const inProvider = p.name.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q);
        const matched = p.models.filter(
          (m) => m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)
        );
        if (!inProvider && !matched.length) return;
        models = matched.length ? matched : p.models;
      }
      rows.push({
        id: p.id,
        name: p.name,
        sub: p.sub,
        logo: p.logo,
        color: I.logoColor(p.logo),
        models,
        provider: p,
      });
    });

    picker.rows = rows;
    picker.visible = rows;
    return rows;
  }

  /* ── Trigger ──────────────────────────────────────────────────────────── */
  function renderTrigger() {
    if (!picker.trigger) return;
    const { provider, model } = current();
    picker.trigger.innerHTML =
      `<span class="ms__logo">${I.logo(provider.logo, 15)}</span>` +
      `<span class="ms__text"><span class="ms__model">${esc(model.name)}</span>` +
      `<span class="ms__provider">${esc(provider.name)}</span></span>` +
      `<span class="ms__chev">${I.ui("chevronDown", 13)}</span>` +
      `<span class="sr-only">Change model</span>`;
  }

  /* ── Panel markup ─────────────────────────────────────────────────────── */
  function rowMarkup(row, i) {
    const logo = row.logo
      ? I.logo(row.logo, 16)
      : `<span style="color:${row.color}">${I.ui("star", 15, 1.6)}</span>`;
    const expanded = picker.expanded === i;
    return (
      `<button class="mp__row${i === picker.active ? " is-active" : ""}${expanded ? " is-expanded" : ""}" ` +
      `type="button" data-row="${i}" style="--row-color:${row.color}; --i:${i}">` +
      `<span class="mp__logo">${logo}</span>` +
      `<span class="mp__row-text"><span class="mp__row-name">${esc(row.name)}</span>` +
      `<span class="mp__row-sub">${esc(row.sub || row.models.length + " models")}</span></span>` +
      `<span class="mp__row-chev">${I.ui(expanded ? "chevronDown" : "chevronRight", 13)}</span>` +
      `</button>`
    );
  }

  function modelMarkup(m, i) {
    const sel = m.id === U.store.state.model;
    const isPinned = pinned().indexOf(m.id) >= 0;
    const tags = (m.tags || [])
      .slice(0, 3)
      .map((t) => `<span class="chip">${I.ui(t.icon, 11)}${esc(t.label)}</span>`)
      .join("");
    return (
      `<button class="mp__model${sel ? " is-selected" : ""}${isPinned ? " is-pinned" : ""}" type="button" ` +
      `data-model="${esc(m.id)}" style="--mi:${i}">` +
      `<span class="mp__pin" data-pin="${esc(m.id)}" role="button" tabindex="-1" aria-label="Pin model">${I.ui(
        "star",
        13
      )}</span>` +
      `<span class="mp__model-top"><span class="mp__model-name">${esc(m.name)}</span>` +
      `<span class="mp__check">${I.ui("check", 14)}</span></span>` +
      `<span class="mp__model-desc">${esc(m.desc)}</span>` +
      `<span class="mp__model-tags">${tags}</span>` +
      `</button>`
    );
  }

  /* Single fluid list — the reference's structure. Each provider row is a
     `motion.button`; the selected/expanded one reveals its models inline,
     exactly like the source's AnimatePresence block. The spring-tracked
     highlight pill (`layoutId="hover-highlight"`) sits behind the hovered row. */
  function renderRows() {
    buildRows();
    const list = picker.panel && picker.panel.querySelector("#mpList");
    if (!list) return;

    const html = picker.visible.length
      ? picker.visible
          .map((row, i) => {
            const expanded = picker.expanded === i;
            return (
              rowMarkup(row, i) +
              (expanded
                ? `<div class="mp__models">${row.models.map(modelMarkup).join("")}</div>`
                : "")
            );
          })
          .join("")
      : `<div class="mp__empty">No provider matches that search.</div>`;

    list.innerHTML = `<div class="mp__pill"></div>${html}`;
    picker.pill = list.querySelector(".mp__pill");
    picker.expanded = picker.expanded == null ? null : picker.expanded;
    movePill(true);
  }

  /** Expand/collapse the inline model group for the active row. */
  function renderModels() {
    const row = picker.visible[Math.min(picker.active, picker.visible.length - 1)];
    if (!row) return;
    picker.expanded = picker.active;
    renderRows();
    movePill(true);
  }

  function collapseModels() {
    picker.expanded = null;
    if (picker.panel) renderRows();
  }

  function movePill(immediate) {
    if (!picker.pill) return;
    const rowEl = picker.pill.parentNode.querySelector(`.mp__row[data-row="${picker.active}"]`);
    if (!rowEl) {
      picker.pill.style.opacity = "0";
      return;
    }
    const top = rowEl.offsetTop;
    picker.pill.style.height = rowEl.offsetHeight + "px";
    picker.pill.style.opacity = "1";

    if (!picker.pillSpring) {
      picker.pillSpring = new T.spring.Spring(top, {
        stiffness: 520,
        damping: 32,
        mass: 1,
        onUpdate: (v) => {
          if (picker.pill) picker.pill.style.transform = `translateY(${v}px)`;
        },
      });
    }
    if (immediate) picker.pillSpring.jump(top);
    else picker.pillSpring.set(top);
  }

  /* ── Open / close ─────────────────────────────────────────────────────── */
  function open() {
    if (picker.open) return;
    picker.open = true;
    picker.query = "";
    picker.focusModels = false;
    picker.active = 0;
    picker.trigger.classList.add("is-open");
    picker.trigger.setAttribute("aria-expanded", "true");

    const sel = current();
    const idx = T.data.PROVIDERS.findIndex((p) => p.id === sel.provider.id);

    picker.portal.innerHTML =
      `<div class="mp" role="dialog" aria-label="Select a model">` +
      `<div class="mp__inner">` +
      `<div class="mp__panel">` +
      `<div class="mp__search"><span class="mp__search-icon">${I.ui("search", 15)}</span>` +
      `<input type="text" placeholder="Search models…" aria-label="Search models"/>` +
      `<button class="mp__close" type="button" data-close aria-label="Close model picker">${I.ui(
        "x",
        15,
        2
      )}</button></div>` +
      `<div class="mp__list" id="mpList"></div>` +
      `<div class="mp__foot"><span>Provider-native routing</span><span class="mp__foot-sep"></span>` +
      `<span><kbd>↑↓</kbd> navigate · <kbd>↵</kbd> select</span></div>` +
      `</div></div></div>`;

    picker.panel = picker.portal.querySelector(".mp");
    buildRows();
    renderRows();

    // Land on the provider that owns the active model.
    const favRow = picker.visible.findIndex((r) => r.id === "__fav");
    picker.active = favRow >= 0 ? 0 : Math.max(0, idx);
    renderRows();
    renderModels();

    const input = picker.panel.querySelector(".mp__search input");
    const panelEl = picker.panel;
    U.on(input, "input", (e) => {
      picker.query = e.target.value;
      picker.active = 0;
      renderRows();
      if (picker.query.trim()) renderModels();
      else collapseModels();
      requestAnimationFrame(() => U.anchorBottom(panelEl, picker.trigger, 10));
    });

    U.on(picker.panel, "click", onPanelClick);
    U.on(picker.panel, "mousemove", onRowHover);

    U.anchorBottom(picker.panel, picker.trigger, 10);

    // Native useClickAway from fluid-dropdown: click anywhere outside closes the picker
    function onClickAway(e) {
      if (!picker.open || !picker.panel) return;
      if (picker.panel.contains(e.target)) return;
      if (picker.trigger && picker.trigger.contains(e.target)) return;
      close();
    }
    picker.clickAway = onClickAway;
    document.addEventListener("pointerdown", onClickAway, { capture: true });

    setTimeout(() => input && input.focus(), 40);
  }

  function close() {
    if (!picker.open) return;
    picker.open = false;
    if (picker.clickAway) {
      document.removeEventListener("pointerdown", picker.clickAway, { capture: true });
      picker.clickAway = null;
    }
    picker.trigger.classList.remove("is-open");
    picker.trigger.setAttribute("aria-expanded", "false");
    const panel = picker.panel;
    if (panel) {
      panel.classList.add("is-closing");
      setTimeout(() => {
        picker.portal.innerHTML = "";
        picker.panel = null;
        picker.pill = null;
      }, 140);
    }
    if (picker.pillSpring) picker.pillSpring.stop();
    picker.pillSpring = null;
  }

  /* ── Interaction ──────────────────────────────────────────────────────── */
  /* Hover ONLY moves the highlight pill — matching the reference, where
     `onHoverStart` just sets hoveredCategory. Re-rendering the list on every
     mousemove is what made the panel twitch. Expansion is a click action. */
  function onRowHover(e) {
    const rowEl = e.target.closest && e.target.closest(".mp__row");
    if (!rowEl) return;
    const i = +rowEl.getAttribute("data-row");
    if (i === picker.active) return;
    picker.active = i;
    highlightActiveRow();
  }

  function highlightActiveRow() {
    if (!picker.panel) return;
    U.qsa(".mp__row", picker.panel).forEach((el, i) => el.classList.toggle("is-active", i === picker.active));
    movePill(false);
  }

  function onPanelClick(e) {
    if (e.target.closest("[data-close]")) return close();

    const pinEl = e.target.closest("[data-pin]");
    if (pinEl) {
      e.stopPropagation();
      togglePin(pinEl.getAttribute("data-pin"));
      return;
    }

    const modelEl = e.target.closest("[data-model]");
    if (modelEl) {
      setModel(modelEl.getAttribute("data-model"));
      U.toast("Model switched", "check");
      close();
      return;
    }

    const rowEl = e.target.closest(".mp__row");
    if (rowEl) {
      const i = +rowEl.getAttribute("data-row");
      // Clicking the already-expanded provider collapses it again.
      if (picker.expanded === i) {
        picker.expanded = null;
        renderRows();
        movePill(true);
        U.anchorBottom(picker.panel, picker.trigger, 10);
        return;
      }
      picker.active = i;
      highlightActiveRow();
      renderModels();
      U.anchorBottom(picker.panel, picker.trigger, 10);
    }
  }

  function onKeydown(e) {
    if (!picker.open) return;
    const key = e.key;

    if (key === "Escape") {
      e.preventDefault();
      close();
      picker.trigger.focus();
      return;
    }
    if (key === "ArrowDown" || key === "ArrowUp") {
      e.preventDefault();
      const n = picker.visible.length;
      picker.active = (picker.active + (key === "ArrowDown" ? 1 : -1) + n) % n;
      highlightActiveRow();
      renderModels();
      const el = picker.panel.querySelector(`.mp__row[data-row="${picker.active}"]`);
      if (el) el.scrollIntoView({ block: "nearest" });
      return;
    }
    if (key === "ArrowRight" || key === "Enter") {
      const first = picker.panel.querySelector(".mp__model");
      if (first) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
      return;
    }
    if (key === "ArrowLeft") {
      const rows = picker.panel.querySelector(".mp__row.is-active");
      if (rows) rows.focus({ preventScroll: true });
    }
  }

  /* ── Mount ────────────────────────────────────────────────────────────── */
  function mount(host, opts) {
    picker.host = host;
    picker.portal = U.qs("#modelPortal");
    picker.onChange = (opts && opts.onChange) || null;

    host.innerHTML = `<button class="ms" type="button" aria-haspopup="dialog" aria-expanded="false"></button>`;
    picker.trigger = host.querySelector(".ms");
    renderTrigger();

    U.on(picker.trigger, "click", (e) => {
      e.stopPropagation();
      picker.open ? close() : open();
    });
    U.on(document, "keydown", onKeydown);
    U.on(window, "resize", () => {
      if (picker.open && picker.panel) U.anchorBottom(picker.panel, picker.trigger, 10);
    });

    return {
      set: setModel,
      get: () => current(),
      close,
    };
  }

  T.modelPicker = { mount, set: setModel, get: current, open, close };
})();
