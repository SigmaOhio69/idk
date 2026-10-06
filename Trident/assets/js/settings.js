/* ============================================================================
   Trident — settings controller
   Ported directly from settings-page-design/app/settings/page.tsx
   ========================================================================== */
(function () {
  const T = (window.Trident = window.Trident || {});
  const U = T.ui;
  const I = T.icon;
  const esc = U.escape;

  let activeTab = "profile";
  let modalEl = null;

  const NAV = [
    {
      group: "Account",
      items: [
        { id: "profile", label: "Profile", icon: "users" },
        { id: "security", label: "Security", icon: "spark" },
      ],
    },
    {
      group: "Preferences",
      items: [
        { id: "general", label: "General", icon: "settings" },
        { id: "appearance", label: "Appearance", icon: "sun" },
        { id: "notifications", label: "Notifications", icon: "bolt" },
      ],
    },
    {
      group: "Billing",
      items: [
        { id: "subscription", label: "Subscription", icon: "zap" },
        { id: "payment", label: "Payment Methods", icon: "card" },
      ],
    },
    {
      group: "Advanced",
      items: [{ id: "privacy", label: "Privacy", icon: "eye" }],
    },
  ];

  function user() {
    return U.store.state.user || { name: "Ada Lovelace", email: "ada@github.local", role: "Research Engineer", plan: "Pro" };
  }

  function renderSidebar() {
    return NAV.map(
      (g) =>
        `<div class="settings-group">` +
        `<div class="settings-group__label">${esc(g.group)}</div>` +
        `<div class="settings-group__items">` +
        g.items
          .map(
            (it) =>
              `<button class="settings-tab${it.id === activeTab ? " is-active" : ""}" type="button" data-tab="${it.id}">` +
              `${I.ui(it.icon, 16)}<span>${esc(it.label)}</span></button>`
          )
          .join("") +
        `</div></div>`
    ).join("");
  }

  function renderContent() {
    const u = user();
    switch (activeTab) {
      case "profile":
        return `
          <div class="st-card">
            <h3 class="st-card__title">Profile Information</h3>
            <p class="st-card__desc">Update your account profile information and email address.</p>
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
              <div style="width:64px;height:64px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 2px #27272a;">
                ${T.avatar ? T.avatar.svg(u.avatarSeed || "trident", { label: "TL" }) : ""}
              </div>
              <div>
                <button class="st-btn st-btn--outline" type="button" id="stChangeAvatar">Generate New Avatar</button>
                <div style="font-size:12px;color:#71717a;margin-top:4px;">Seeded procedural SVG portrait</div>
              </div>
            </div>
            <div class="st-field">
              <label for="stName">Display Name</label>
              <input class="st-input" id="stName" value="${esc(u.name)}" />
            </div>
            <div class="st-field">
              <label for="stEmail">Email Address</label>
              <input class="st-input" id="stEmail" type="email" value="${esc(u.email)}" />
            </div>
            <div class="st-field">
              <label for="stBio">Bio</label>
              <textarea class="st-textarea" id="stBio" placeholder="Tell us about yourself...">Engineer building frontier multi-model workflows with Trident.</textarea>
            </div>
            <button class="st-btn" type="button" id="stSaveProfile">Save Changes</button>
          </div>
        `;
      case "security":
        return `
          <div class="st-card">
            <h3 class="st-card__title">Password</h3>
            <p class="st-card__desc">Change your password to keep your account secure.</p>
            <div class="st-field"><label>Current Password</label><input class="st-input" type="password" /></div>
            <div class="st-field"><label>New Password</label><input class="st-input" type="password" /></div>
            <div class="st-field"><label>Confirm New Password</label><input class="st-input" type="password" /></div>
            <button class="st-btn" type="button" onclick="Trident.ui.toast('Password updated','check')">Update Password</button>
          </div>
          <div class="st-card">
            <h3 class="st-card__title">Two-Factor Authentication</h3>
            <p class="st-card__desc">Add an extra layer of security to your account.</p>
            <div class="st-row">
              <div class="st-row__text"><b>Authenticator App</b><span>Generate codes via 1Password, Google Authenticator</span></div>
              <button class="st-switch is-on" type="button" onclick="this.classList.toggle('is-on')"><span class="st-switch__thumb"></span></button>
            </div>
            <div class="st-row">
              <div class="st-row__text"><b>SMS Verification</b><span>Receive backup one-time codes via mobile</span></div>
              <button class="st-switch" type="button" onclick="this.classList.toggle('is-on')"><span class="st-switch__thumb"></span></button>
            </div>
          </div>
        `;
      case "appearance":
        return `
          <div class="st-card">
            <h3 class="st-card__title">Theme & Layout</h3>
            <p class="st-card__desc">Customize interface theme, surface tones, and visual density.</p>
            <div class="st-row">
              <div class="st-row__text"><b>Dark Canvas Mode</b><span>Jet-black background with subtle luminance steps</span></div>
              <button class="st-switch is-on" type="button"><span class="st-switch__thumb"></span></button>
            </div>
            <div class="st-row">
              <div class="st-row__text"><b>Minimalist Layout</b><span>Discipline visual hierarchy and remove redundant chrome</span></div>
              <button class="st-switch is-on" type="button"><span class="st-switch__thumb"></span></button>
            </div>
            <div class="st-row">
              <div class="st-row__text"><b>Fluid Spring Animations</b><span>Framer Motion physics on pills and popovers</span></div>
              <button class="st-switch is-on" type="button" onclick="this.classList.toggle('is-on')"><span class="st-switch__thumb"></span></button>
            </div>
          </div>
        `;
      case "notifications":
        return `
          <div class="st-card">
            <h3 class="st-card__title">Email Notifications</h3>
            <p class="st-card__desc">Choose what updates and reports you wish to receive.</p>
            <div class="st-row">
              <div class="st-row__text"><b>Model Release Alerts</b><span>Get notified when new frontier models land</span></div>
              <button class="st-switch is-on" type="button" onclick="this.classList.toggle('is-on')"><span class="st-switch__thumb"></span></button>
            </div>
            <div class="st-row">
              <div class="st-row__text"><b>Weekly Usage Summary</b><span>Token count and provider breakdown reports</span></div>
              <button class="st-switch" type="button" onclick="this.classList.toggle('is-on')"><span class="st-switch__thumb"></span></button>
            </div>
          </div>
        `;
      case "subscription":
        return `
          <div class="st-card">
            <h3 class="st-card__title">Current Plan</h3>
            <p class="st-card__desc">You are currently subscribed to the Pro Developer tier.</p>
            <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:12px;">
              <span style="font-size:24px;font-weight:700;color:#fafafa;">Pro Tier</span>
              <span style="font-size:13px;color:#38bdf8;background:rgba(56,189,248,0.1);padding:2px 8px;border-radius:999px;">Active</span>
            </div>
            <p style="font-size:13px;color:#a1a1aa;margin:0 0 16px;">Unlimited frontier routing across Anthropic, OpenAI, DeepSeek, Google, and Meta.</p>
            <button class="st-btn st-btn--outline" type="button" onclick="Trident.ui.toast('Billing portal opens in new tab','card')">Manage Invoices & Billing</button>
          </div>
        `;
      case "payment":
        return `
          <div class="st-card">
            <h3 class="st-card__title">Payment Methods</h3>
            <p class="st-card__desc">Primary cards and payment providers on file.</p>
            <div class="st-row">
              <div class="st-row__text"><b>Mastercard ending in 4242</b><span>Expires 12/28 · Default</span></div>
              <span style="font-size:12px;color:#38bdf8;">Verified</span>
            </div>
          </div>
        `;
      case "privacy":
        return `
          <div class="st-card">
            <h3 class="st-card__title">Data Privacy & Retention</h3>
            <p class="st-card__desc">Control thread retention and telemetry preferences.</p>
            <div class="st-row">
              <div class="st-row__text"><b>Local-Only Storage</b><span>Persist chats strictly to client storage</span></div>
              <button class="st-switch is-on" type="button"><span class="st-switch__thumb"></span></button>
            </div>
            <div class="st-row">
              <div class="st-row__text"><b>Zero Model Training</b><span>Never permit providers to train on conversation data</span></div>
              <button class="st-switch is-on" type="button"><span class="st-switch__thumb"></span></button>
            </div>
          </div>
        `;
      default:
        return `<div class="st-card"><h3 class="st-card__title">General Settings</h3></div>`;
    }
  }

  function mountModal() {
    if (modalEl) return;
    modalEl = document.createElement("div");
    modalEl.className = "settings-modal";
    modalEl.id = "settingsModal";
    modalEl.innerHTML = `
      <div class="settings-box">
        <aside class="settings-side">
          <div class="settings-side__head"><h2>Settings</h2></div>
          <nav class="settings-side__nav" id="settingsNav"></nav>
        </aside>
        <div class="settings-content">
          <div class="settings-content__head">
            <h1 class="settings-content__title" id="settingsTitle">Profile</h1>
            <button class="settings-close" type="button" id="settingsClose" aria-label="Close settings">${I.ui("x", 16, 2)}</button>
          </div>
          <div class="settings-content__body" id="settingsBody"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);

    U.on(modalEl.querySelector("#settingsClose"), "click", close);
    U.on(modalEl, "pointerdown", (e) => {
      if (e.target === modalEl) close();
    });

    U.on(modalEl.querySelector("#settingsNav"), "click", (e) => {
      const btn = e.target.closest("[data-tab]");
      if (!btn) return;
      activeTab = btn.getAttribute("data-tab");
      update();
    });
  }

  function update() {
    if (!modalEl) return;
    const nav = modalEl.querySelector("#settingsNav");
    const body = modalEl.querySelector("#settingsBody");
    const title = modalEl.querySelector("#settingsTitle");

    nav.innerHTML = renderSidebar();
    body.innerHTML = renderContent();
    title.textContent = activeTab;

    // Attach actions
    const changeAv = body.querySelector("#stChangeAvatar");
    if (changeAv) {
      U.on(changeAv, "click", () => {
        const u = user();
        u.avatarSeed = T.avatar ? T.avatar.randomSeed() : Date.now();
        U.store.set({ user: u });
        if (T.profile) T.profile.paintAvatars();
        update();
        U.toast("Avatar updated", "spark");
      });
    }

    const saveBtn = body.querySelector("#stSaveProfile");
    if (saveBtn) {
      U.on(saveBtn, "click", () => {
        const u = user();
        const nameIn = body.querySelector("#stName");
        const emailIn = body.querySelector("#stEmail");
        if (nameIn) u.name = nameIn.value.trim() || u.name;
        if (emailIn) u.email = emailIn.value.trim() || u.email;
        U.store.set({ user: u });
        if (T.profile) T.profile.paintAvatars();
        U.toast("Profile settings saved", "check");
      });
    }
  }

  function open(tab) {
    mountModal();
    if (tab) activeTab = tab;
    update();
    requestAnimationFrame(() => modalEl.classList.add("is-open"));
  }

  function close() {
    if (!modalEl) return;
    modalEl.classList.remove("is-open");
  }

  function init() {
    // Open settings from sidebar button or profile card
    U.on(document, "click", (e) => {
      const trigger = e.target.closest('[data-team="settings"], [data-nav="settings"], [data-settings], a[href="#settings"]');
      if (trigger) {
        e.preventDefault();
        open();
      }
    });

    const sideSettings = document.querySelector('.nav__item[data-item="settings"], [data-tab="settings"]');
    if (sideSettings) {
      U.on(sideSettings, "click", (e) => {
        e.preventDefault();
        open();
      });
    }
  }

  T.settings = { open, close, init };
})();
