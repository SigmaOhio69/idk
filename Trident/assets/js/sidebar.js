/* ============================================================================
   Trident — sidebar
   Collapse choreography, drag-to-resize, collapsible groups, thread list.
   ========================================================================== */
(function () {
  const T = (window.Trident = window.Trident || {});
  const U = T.ui;
  const I = T.icon;
  const esc = U.escape;

  const MIN_W = 244;
  const MAX_W = 380;
  const COLLAPSE_W = 180;

  const sb = {
    app: null,
    el: null,
    collapsed: false,
    width: 280,
    resizing: false,
  };

  const PRIMARY = [
    { id: "overview", label: "Overview", icon: "home", active: true },
    { id: "models", label: "Model catalogue", icon: "layers" },
  ];

  const WORKSPACE = [{ id: "settings", label: "Settings", icon: "settings" }];

  /* ── Markup helpers ───────────────────────────────────────────────────── */
  function navItem(item, opts) {
    const o = opts || {};
    const icon = o.logo
      ? `<span class="nav__icon nav__icon--logo">${I.logo(o.logo, 16)}</span>`
      : `<span class="nav__icon">${I.ui(item.icon, 17)}</span>`;
    return (
      `<button class="nav__item${item.active ? " is-active" : ""}" type="button" data-nav="${item.id}" ${o.attr || ""}>` +
      icon +
      `<span class="nav__label">${esc(item.label)}</span>` +
      (o.meta ? `<span class="nav__meta">${esc(o.meta)}</span>` : "") +
      (o.action ? `<span class="nav__action" ${o.actionAttr} role="button" tabindex="-1">${I.ui("trash", 14)}</span>` : "") +
      `<span class="tip">${esc(item.label)}</span>` +
      `</button>`
    );
  }

  function renderStatic() {
    const primary = U.qs("#navPrimary");
    const workspace = U.qs("#navWorkspace");
    primary.innerHTML = PRIMARY.map((i) => navItem(i)).join("");
    workspace.innerHTML = WORKSPACE.map((i) => navItem(i)).join("");
  }

  function renderThreads() {
    const host = U.qs("#navThreads");
    const count = U.qs("#threadCount");
    const query = (U.qs("#sidebarSearch").value || "").trim().toLowerCase();
    const list = T.chat.chats();

    const filtered = query
      ? list.filter(
          (c) =>
            (c.title || "").toLowerCase().includes(query) ||
            c.messages.some((m) => (m.text || "").toLowerCase().includes(query))
        )
      : list;

    count.textContent = String(list.length);
    host.innerHTML = filtered
      .map((c) => {
        const found = T.data.findModel(c.model || U.store.state.model);
        const isActive = c.id === U.store.state.activeId;
        const item = { id: c.id, label: c.title || "New thread", active: isActive, icon: "layers" };
        return navItem(item, {
          logo: found.provider.logo,
          meta: U.relative(c.updatedAt || c.createdAt || Date.now()),
          attr: `data-chat="${c.id}"`,
          action: true,
          actionAttr: `data-del="${c.id}"`,
        });
      })
      .join("");

    if (!filtered.length) {
      host.innerHTML = `<div class="mp__empty">No threads match “${esc(query)}”.</div>`;
    }
  }

  /* ── Collapse ─────────────────────────────────────────────────────────── */
  function applyWidth() {
    sb.app.style.setProperty("--sidebar-width", sb.width + "px");
  }

  function setCollapsed(next, persist) {
    sb.collapsed = next;
    sb.app.setAttribute("data-sidebar", next ? "collapsed" : "expanded");
    const trig = U.qs("#topbarTrigger");
    if (trig) trig.setAttribute("aria-label", next ? "Expand sidebar" : "Collapse sidebar");
    if (persist !== false) {
      const ui = U.store.state.ui;
      ui.sidebar.collapsed = next;
      U.store.save();
    }
  }

  function toggle() {
    setCollapsed(!sb.collapsed);
  }

  /* Mobile drawer */
  function setDrawer(open) {
    sb.app.setAttribute("data-drawer", open ? "open" : "closed");
    const scrim = U.qs("#scrim");
    if (open) {
      scrim.hidden = false;
      requestAnimationFrame(() => scrim.classList.add("is-in"));
    } else {
      scrim.classList.remove("is-in");
      setTimeout(() => (scrim.hidden = true), 220);
    }
  }

  /* ── Collapsible groups ───────────────────────────────────────────────── */
  function setGroup(name, open) {
    const head = U.qs(`.group__head[data-collapse="${name}"]`);
    const body = U.qs(`#group${name[0].toUpperCase()}${name.slice(1)}`);
    if (!head || !body) return;
    head.setAttribute("aria-expanded", open ? "true" : "false");
    body.style.height = open ? body.querySelector(".group__inner").scrollHeight + "px" : "0px";
    if (!body.dataset.wired) {
      U.on(window, "resize", () => {
        if (head.getAttribute("aria-expanded") === "true") {
          body.style.height = body.querySelector(".group__inner").scrollHeight + "px";
        }
      });
      body.dataset.wired = "1";
    }
    const ui = U.store.state.ui;
    ui.sidebar.groups[name] = open;
    U.store.save();
  }

  /* ── Drag to resize ───────────────────────────────────────────────────── */
  function initResize() {
    const rail = U.qs("#sidebarRail");
    if (!rail) return;

    let startX = 0;
    let startW = 0;

    U.on(rail, "pointerdown", (e) => {
      if (sb.collapsed) return;
      sb.resizing = true;
      startX = e.clientX;
      startW = sb.width;
      rail.classList.add("is-active");
      document.body.classList.add("is-resizing");
      rail.setPointerCapture(e.pointerId);
    });

    U.on(rail, "pointermove", (e) => {
      if (!sb.resizing) return;
      sb.width = U.clamp(startW + (e.clientX - startX), MIN_W, MAX_W);
      applyWidth();
    });

    U.on(rail, "pointerup", () => {
      if (!sb.resizing) return;
      sb.resizing = false;
      rail.classList.remove("is-active");
      document.body.classList.remove("is-resizing");
      if (sb.width < COLLAPSE_W) {
        sb.width = 280;
        applyWidth();
        setCollapsed(true);
      } else {
        const ui = U.store.state.ui;
        ui.sidebar.width = Math.round(sb.width);
        U.store.save();
      }
    });

    U.on(rail, "dblclick", () => {
      sb.width = 280;
      applyWidth();
      const ui = U.store.state.ui;
      ui.sidebar.width = 280;
      U.store.save();
      U.toast("Sidebar width reset", "refresh");
    });
  }

  /* ── Init ─────────────────────────────────────────────────────────────── */
  function init() {
    sb.app = U.qs("#app");
    sb.el = U.qs("#sidebar");

    const ui = U.store.state.ui;
    sb.width = ui.sidebar.width || 280;
    applyWidth();

    renderStatic();
    renderThreads();

    setCollapsed(!!ui.sidebar.collapsed, false);
    setGroup("threads", ui.sidebar.groups.threads !== false);
    setGroup("team", !!ui.sidebar.groups.team);

    // Static glyphs
    const inject = (id, html) => {
      const el = U.qs("#" + id);
      if (el) el.innerHTML = html;
    };
    inject("wsMark", I.trident(18, 1.9));
    inject("wsChev", I.ui("chevronDown", 14));
    inject("sidebarSearchIcon", I.ui("search", 15));
    inject("newChatIcon", I.ui("plus", 17));
    inject("profileMore", I.ui("more", 14));
    inject("newChatTopIcon", I.ui("plus", 16));

    // Collapse controls — single trigger in the topbar (source has one).
    U.on(U.qs("#topbarTrigger"), "click", () => {
      if (window.matchMedia("(max-width: 900px)").matches) setDrawer(sb.app.getAttribute("data-drawer") !== "open");
      else toggle();
    });
    U.on(U.qs("#scrim"), "click", () => setDrawer(false));

    // Groups
    U.qsa(".group__head").forEach((head) => {
      head.querySelector(".group__chev").innerHTML = I.ui("chevronRight", 12);
      U.on(head, "click", () => {
        const name = head.getAttribute("data-collapse");
        const open = head.getAttribute("aria-expanded") === "true";
        setGroup(name, !open);
      });
    });

    // Navigation
    U.on(sb.el, "click", (e) => {
      const del = e.target.closest("[data-del]");
      if (del) {
        e.stopPropagation();
        T.chat.removeChat(del.getAttribute("data-del"));
        U.toast("Thread deleted", "trash");
        return;
      }
      const chatEl = e.target.closest("[data-chat]");
      if (chatEl) {
        T.chat.selectChat(chatEl.getAttribute("data-chat"));
        if (window.matchMedia("(max-width: 900px)").matches) setDrawer(false);
        return;
      }
      const item = e.target.closest(".nav__item");
      if (item) {
        const navId = item.getAttribute("data-nav");
        if (navId === "settings") {
          if (T.settings) T.settings.open();
          return;
        }
        if (navId === "models") {
          if (T.modelPicker) T.modelPicker.open();
          return;
        }
        U.qsa(".nav__item", sb.el).forEach((n) => n.classList.remove("is-active"));
        item.classList.add("is-active");
      }
    });

    // New Chat
    U.on(U.qs("#newChat"), "click", () => {
      T.chat.newChat();
      if (window.matchMedia("(max-width: 900px)").matches) setDrawer(false);
    });

    // Search
    U.on(U.qs("#sidebarSearch"), "input", renderThreads);

    // Workspace button
    U.on(U.qs("#wsButton"), "click", () => U.toast("Workspace switcher coming next", "spark"));

    // Shortcuts
    U.on(document, "keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (window.matchMedia("(max-width: 900px)").matches) setDrawer(sb.app.getAttribute("data-drawer") !== "open");
        else toggle();
      }
      if (e.key === "Escape" && sb.app.getAttribute("data-drawer") === "open") setDrawer(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = U.qs("#sidebarSearch");
        if (input) input.focus();
      }
    });

    T.chat.onChange(renderThreads);
    initResize();
  }

  T.sidebar = { init, renderThreads, setCollapsed, toggle };
})();
