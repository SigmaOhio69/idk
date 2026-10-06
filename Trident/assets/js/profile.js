/* ============================================================================
   Trident — profile card
   Popover identity card with a generated avatar, stats and account actions.
   ========================================================================== */
(function () {
  const T = (window.Trident = window.Trident || {});
  const U = T.ui;
  const I = T.icon;
  const esc = U.escape;

  const pf = { portal: null, open: false, panel: null };

  function user() {
    return U.store.state.user || { name: "Guest", email: "", role: "Member", plan: "Free", avatarSeed: "trident" };
  }

  function avatarMarkup(seed, label) {
    return T.avatar.svg(seed, { label });
  }

  function paintAvatars() {
    const u = user();
    const label = T.avatar.initialsFrom(u.name);
    const side = U.qs("#profileAvatar");
    const header = U.qs("#headerAvatar");
    const name = U.qs("#profileName");
    const role = U.qs("#profileRole");
    if (side) side.innerHTML = avatarMarkup(u.avatarSeed, label);
    if (header) header.innerHTML = avatarMarkup(u.avatarSeed, label);
    if (name) name.textContent = u.name;
    if (role) role.textContent = u.role;
  }

  function stats() {
    const threads = T.chat.chats().length;
    return [
      { v: threads, l: "threads" },
      { v: T.data.PROVIDERS.length, l: "providers" },
      { v: T.data.PROVIDERS.reduce((n, p) => n + p.models.length, 0), l: "models" },
    ];
  }

  function menuItem(icon, label, value, external) {
    return (
      `<button class="pc__item" type="button">` +
      `<div class="pc__item-left"><span class="pc__item-icon">${I.ui(icon, 16)}</span><span class="pc__item-label">${esc(label)}</span></div>` +
      (value || external
        ? `<div class="pc__item-right">${value ? `<span class="pc__item-value">${esc(value)}</span>` : ""}${
            external ? `<span class="pc__item-ext">${I.ui("upRight", 14)}</span>` : ""
          }</div>`
        : "") +
      `</button>`
    );
  }

  function render() {
    const u = user();
    const trigger = U.qs("#profileTrigger");
    trigger.setAttribute("aria-expanded", "true");

    /* Structure ported directly from profile-card/components/kokonutui/profile-01.tsx:
       avatar with ring + status dot · name/role · divider · menu items with
       icon+label grouped on the left, and value/external on the right · logout */
    pf.portal.innerHTML =
      `<div class="pc" role="dialog" aria-label="Account">` +
      `<div class="pc__card">` +
      `<div class="pc__body">` +
      `<div class="pc__top">` +
      `<div class="pc__avatar-wrap">` +
      `<div class="pc__avatar">${avatarMarkup(u.avatarSeed, T.avatar.initialsFrom(u.name))}` +
      `<button class="pc__shuffle" type="button" data-shuffle aria-label="Generate a new avatar">${I.ui(
        "refresh",
        20
      )}</button></div>` +
      `<span class="pc__status"></span></div>` +
      `<div class="pc__id">` +
      `<div class="pc__name">${esc(u.name)}</div>` +
      `<div class="pc__role">${esc(u.role)}</div>` +
      `</div></div>` +
      `<div class="pc__divider"></div>` +
      `<div class="pc__menu">` +
      menuItem("card", "Subscription", u.plan) +
      menuItem("settings", "Settings") +
      menuItem("file", "Terms & Policies", null, true) +
      `<button class="pc__item pc__item--danger" type="button" data-logout>` +
      `<div class="pc__item-left"><span class="pc__item-icon">${I.ui("logout", 16)}</span><span class="pc__item-label">Log out</span></div></button>` +
      `</div></div></div></div>`;

    pf.panel = pf.portal.querySelector(".pc");
    U.anchorBottom(pf.panel, trigger, 8);

    U.on(pf.panel, "click", (e) => {
      if (e.target.closest("[data-shuffle]")) {
        const seed = T.avatar.randomSeed();
        const cur = Object.assign({}, user(), { avatarSeed: seed });
        U.store.set({ user: cur });
        paintAvatars();
        render();
        U.toast("New avatar generated", "spark");
        return;
      }
      if (e.target.closest("[data-logout]")) {
        close();
        T.app.logout();
        return;
      }
      const item = e.target.closest(".pc__item");
      if (item) {
        close();
        const txt = (item.textContent || "").toLowerCase();
        if (txt.includes("settings")) {
          if (T.settings) T.settings.open("general");
        } else if (txt.includes("subscription")) {
          if (T.settings) T.settings.open("subscription");
        } else if (txt.includes("terms")) {
          if (T.settings) T.settings.open("privacy");
        }
      }
    });

    // Native useClickAway from fluid-dropdown: click anywhere outside closes the popover
    function onClickAway(e) {
      if (!pf.open || !pf.panel) return;
      if (pf.panel.contains(e.target)) return;
      if (trigger && trigger.contains(e.target)) return;
      const headerAv = U.qs("#headerAvatar");
      if (headerAv && headerAv.contains(e.target)) return;
      close();
    }
    pf.clickAway = onClickAway;
    document.addEventListener("pointerdown", onClickAway, { capture: true });
  }

  function open() {
    if (pf.open) return close();
    pf.open = true;
    render();
  }

  function close() {
    if (!pf.open) return;
    pf.open = false;
    if (pf.clickAway) {
      document.removeEventListener("pointerdown", pf.clickAway, { capture: true });
      pf.clickAway = null;
    }
    const trigger = U.qs("#profileTrigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    const panel = pf.panel;
    if (panel) {
      panel.classList.add("is-closing");
      setTimeout(() => {
        pf.portal.innerHTML = "";
        pf.panel = null;
      }, 150);
    }
  }

  function init() {
    pf.portal = U.qs("#profilePortal");
    paintAvatars();
    U.on(U.qs("#profileTrigger"), "click", (e) => {
      e.stopPropagation();
      open();
    });
    U.on(window, "resize", () => {
      if (pf.open && pf.panel) U.anchorBottom(pf.panel, U.qs("#profileTrigger"), 8);
    });
  }

  T.profile = { init, paintAvatars, open, close };
})();
