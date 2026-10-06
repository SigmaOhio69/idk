/* ============================================================================
   Trident — bootstrap
   Theme, authentication flow, module wiring.
   ========================================================================== */
(function () {
  const T = (window.Trident = window.Trident || {});
  const U = T.ui;
  const I = T.icon;

  const app = { booted: false, mode: "login" };

  /* ── Theme ────────────────────────────────────────────────────────────── */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = U.qs("#themeToggle");
    if (btn) btn.innerHTML = I.ui(theme === "dark" ? "sun" : "moon", 17);
    const ui = U.store.state.ui;
    ui.theme = theme;
    U.store.save();
  }

  function initTheme() {
    const stored = U.store.state.ui.theme;
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(stored || (prefersLight ? "light" : "dark"));
    const btn = U.qs("#themeToggle");
    if (btn) U.on(btn, "click", () => applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));
  }

  /* ── Auth ─────────────────────────────────────────────────────────────── */
  function setMode(mode) {
    app.mode = mode;
    const isSignup = mode === "signup";
    U.qsa(".auth__tab").forEach((t) => {
      const on = t.getAttribute("data-mode") === mode;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    const pill = U.qs(".auth__tab-pill");
    if (pill) pill.style.transform = isSignup ? "translateX(100%)" : "translateX(0)";

    U.qs("#authTitle").textContent = isSignup ? "Create an account" : "Login to your account";
    U.qs("#authSubtitle").textContent = isSignup
      ? "Enter your email below to create your account"
      : "Enter your email below to login to your account";
    U.qs("#authSubmit").querySelector(".btn__label").textContent = isSignup ? "Create account" : "Login";
    U.qs("#authConfirm").autocomplete = isSignup ? "new-password" : "current-password";
    U.qs("#authPassword").autocomplete = isSignup ? "new-password" : "current-password";

    document.querySelector('[data-field="name"]').hidden = !isSignup;
    document.querySelector('[data-field="confirm"]').hidden = !isSignup;
    document.querySelector("[data-login-only]").hidden = isSignup;
    U.qs("#authAlt").innerHTML = isSignup
      ? `<span>Already have an account?</span> <a href="#" id="authSwitch">Login</a>`
      : `<span>Don't have an account?</span> <a href="#" id="authSwitch">Sign up</a>`;
    U.on(U.qs("#authSwitch"), "click", (e) => {
      e.preventDefault();
      setMode(isSignup ? "login" : "signup");
    });
    clearErrors();
  }

  function clearErrors() {
    U.qsa(".field").forEach((f) => f.classList.remove("is-invalid"));
  }

  function setError(field, msg) {
    const wrap = document.querySelector(`[data-field="${field}"]`);
    if (!wrap) return;
    wrap.classList.add("is-invalid");
    const out = wrap.querySelector(".field__error");
    if (out) out.textContent = msg;
  }

  function nameFromEmail(email) {
    const local = String(email || "").split("@")[0] || "Operator";
    return local
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }

  function submit(e) {
    e.preventDefault();
    clearErrors();

    const email = U.qs("#authEmail").value.trim();
    const password = U.qs("#authPassword").value;
    const confirm = U.qs("#authConfirm").value;
    const isSignup = app.mode === "signup";
    let ok = true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("email", "Enter a valid email address.");
      ok = false;
    }
    if (password.length < 8) {
      setError("password", "Use at least 8 characters.");
      ok = false;
    }
    if (isSignup && password !== confirm) {
      setError("confirm", "Passwords do not match.");
      ok = false;
    }
    if (!ok) return;

    const btn = U.qs("#authSubmit");
    btn.classList.add("is-loading");
    btn.disabled = true;

    setTimeout(() => {
      btn.classList.remove("is-loading");
      btn.disabled = false;
      const nameField = U.qs("#authName").value.trim();
      const user = {
        name: isSignup ? nameField || nameFromEmail(email) : nameFromEmail(email),
        email,
        role: isSignup ? "Founder" : "Prompt Engineer",
        plan: isSignup ? "Trial" : "Pro",
        avatarSeed: T.avatar.randomSeed(),
        joined: Date.now(),
      };
      U.store.set({ user });
      enterApp();
    }, 900);
  }

  /* ── Entry / exit / view transitions ──────────────────────────────────── */
  function showLanding() {
    document.body.classList.remove("in-app");
    const landing = U.qs("#landing");
    const auth = U.qs("#auth");
    const appEl = U.qs("#app");
    if (auth) {
      auth.classList.add("is-leaving");
      setTimeout(() => {
        auth.hidden = true;
        auth.classList.remove("is-leaving");
        if (landing) landing.hidden = false;
      }, 250);
    } else {
      if (landing) landing.hidden = false;
    }
    if (appEl) {
      appEl.hidden = true;
      appEl.classList.remove("is-entered");
    }
  }

  function showAuth(mode = "login") {
    document.body.classList.remove("in-app");
    const landing = U.qs("#landing");
    const auth = U.qs("#auth");
    const appEl = U.qs("#app");
    if (landing) landing.hidden = true;
    if (appEl) {
      appEl.hidden = true;
      appEl.classList.remove("is-entered");
    }
    if (auth) {
      auth.hidden = false;
      auth.classList.remove("is-leaving");
      auth.classList.add("is-returning");
      setTimeout(() => auth.classList.remove("is-returning"), 400);
      setMode(mode);
    }
  }

  function enterApp() {
    document.body.classList.add("in-app");
    const landing = U.qs("#landing");
    const auth = U.qs("#auth");
    const appEl = U.qs("#app");

    if (landing) landing.hidden = true;
    if (auth) {
      auth.classList.add("is-leaving");
      setTimeout(() => {
        auth.hidden = true;
        auth.classList.remove("is-leaving");
        if (appEl) {
          appEl.hidden = false;
          bootApp();
          requestAnimationFrame(() => appEl.classList.add("is-entered"));
        }
      }, 250);
    } else if (appEl) {
      appEl.hidden = false;
      bootApp();
      requestAnimationFrame(() => appEl.classList.add("is-entered"));
    }
  }

  function logout() {
    document.body.classList.remove("in-app");
    const auth = U.qs("#auth");
    const appEl = U.qs("#app");
    const landing = U.qs("#landing");
    T.modelPicker.close();
    if (appEl) appEl.classList.add("is-leaving");
    U.store.set({ user: null });
    setTimeout(() => {
      if (appEl) {
        appEl.hidden = true;
        appEl.classList.remove("is-leaving", "is-entered");
      }
      if (auth) auth.hidden = true;
      if (landing) landing.hidden = false;
      setMode("login");
      const pass = U.qs("#authPassword");
      if (pass) pass.value = "";
      const conf = U.qs("#authConfirm");
      if (conf) conf.value = "";
    }, 340);
  }

  /* ── App modules ──────────────────────────────────────────────────────── */
  function bootApp() {
    if (app.booted) {
      T.chat.render();
      return;
    }
    app.booted = true;

    T.modelPicker.mount(U.qs("#modelSelectorHost"), {
      onChange: (found) => {
        T.chat.setModel(found.model.id);
      },
    });

    T.chat.init();
    T.sidebar.init();
    T.profile.init();
    if (T.settings) T.settings.init();

    // Safety net: any Escape or window blur releases open popups.
    U.on(document, "keydown", (e) => {
      if (e.key === "Escape") {
        T.modelPicker.close();
        T.profile.close();
        if (T.settings) T.settings.close();
      }
    });
    U.on(window, "blur", () => {
      T.modelPicker.close();
      T.profile.close();
    });
  }

  /* ── Boot ─────────────────────────────────────────────────────────────── */
  function boot() {
    U.store.load();
    initTheme();

    // Static brand glyphs
    const mark = U.qs("#authBrandMark");
    if (mark) mark.innerHTML = I.trident(24, 1.9);
    const heroMark = U.qs("#heroMark");
    if (heroMark) heroMark.innerHTML = I.trident(28, 1.9);
    // lucide PanelLeft — the single sidebar toggle, as in the source.
    const topbarTrigger = U.qs("#topbarTrigger");
    if (topbarTrigger) topbarTrigger.innerHTML = I.ui("panelLeft", 17, 1.8);
    const gh = U.qs("#authGithubIcon");
    if (gh) gh.innerHTML = I.ui("github", 16);
    const peek = U.qs("#authPeek");
    if (peek) peek.innerHTML = I.ui("eye", 16);
    const backIcon = U.qs("#authBackIcon");
    if (backIcon) backIcon.innerHTML = I.ui("chevronLeft", 14);

    // Panel avatars
    const avatars = U.qs("#authAvatars");
    if (avatars) {
      avatars.innerHTML = [1, 2, 3, 4]
        .map((i) => T.avatar.svg("panel-" + i, { label: "T" + i }))
        .join("");
    }

    // Auth wiring
    U.qsa(".auth__tab").forEach((t) => U.on(t, "click", () => setMode(t.getAttribute("data-mode"))));
    U.on(U.qs("#authForm"), "submit", submit);
    U.on(U.qs("#authSwitch"), "click", (e) => {
      e.preventDefault();
      setMode(app.mode === "login" ? "signup" : "login");
    });
    U.on(U.qs("#authPeek"), "click", () => {
      const input = U.qs("#authPassword");
      const shown = input.type === "text";
      input.type = shown ? "password" : "text";
      U.qs("#authPeek").innerHTML = I.ui(shown ? "eye" : "eyeOff", 16);
    });
    U.on(U.qs("#authGithub"), "click", () => {
      U.toast("GitHub OAuth needs a backend — signing in with a demo identity", "github");
      U.store.set({
        user: {
          name: "Ada Lovelace",
          email: "ada@github.local",
          role: "Research Engineer",
          plan: "Pro",
          avatarSeed: T.avatar.randomSeed(),
          joined: Date.now(),
        },
      });
      enterApp();
    });
    U.on(U.qs("#authForgot"), "click", (e) => {
      e.preventDefault();
      U.toast("Password reset isn't wired in this build", "spark");
    });

    // Intercept clicks on links that lead to app or login from landing
    U.qsa('a[href="app.html"], a[href="#login"], a[href="#signup"]').forEach((a) => {
      U.on(a, "click", (e) => {
        e.preventDefault();
        if (U.store.state.user) {
          enterApp();
        } else {
          const txt = (a.textContent || "").toLowerCase();
          const isSignup = txt.includes("free") || txt.includes("sign up") || a.getAttribute("href") === "#signup";
          showAuth(isSignup ? "signup" : "login");
        }
      });
    });

    const back = U.qs("#authBack");
    if (back) {
      U.on(back, "click", (e) => {
        e.preventDefault();
        showLanding();
      });
    }

    setMode("login");

    // Testing & screenshot state controller
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    if (view) {
      if (view === "landing") {
        showLanding();
      } else if (view === "landing-bento") {
        showLanding();
        setTimeout(() => {
          const el = U.qs("#features-section");
          if (el) el.scrollIntoView();
        }, 120);
      } else if (view === "landing-models") {
        showLanding();
        setTimeout(() => {
          const el = U.qs("#models-section");
          if (el) el.scrollIntoView();
        }, 120);
      } else if (view === "landing-faq") {
        showLanding();
        setTimeout(() => {
          const el = U.qs("#faq-section");
          if (el) el.scrollIntoView();
        }, 120);
      } else if (view === "auth-login") {
        showAuth("login");
      } else if (view === "auth-signup") {
        showAuth("signup");
      } else if (view === "auth-error") {
        showAuth("login");
        setTimeout(() => {
          setError("email", "Enter a valid email address.");
          setError("password", "Use at least 8 characters.");
        }, 50);
      } else if (view.startsWith("app")) {
        // Sign in realistic user immediately without animation delay
        U.store.set({
          user: {
            name: "John Doe",
            email: "john@trident.ai",
            role: "Prompt Engineer",
            plan: "Pro",
            avatarSeed: 48192,
            joined: Date.now(),
          },
        });
        if (U.qs("#landing")) U.qs("#landing").hidden = true;
        if (U.qs("#auth")) U.qs("#auth").hidden = true;
        const appEl = U.qs("#app");
        if (appEl) {
          appEl.hidden = false;
          appEl.classList.add("is-entered");
          bootApp();
        }

        if (view === "app-empty") {
          T.chat.newChat();
        } else if (view === "app-active") {
          const list = T.chat.chats();
          if (list && list[0]) T.chat.selectChat(list[0].id);
        } else if (view === "app-sidebar-collapsed") {
          const list = T.chat.chats();
          if (list && list[0]) T.chat.selectChat(list[0].id);
          T.sidebar.setCollapsed(true);
        } else if (view === "app-dropdown-open") {
          const list = T.chat.chats();
          if (list && list[0]) T.chat.selectChat(list[0].id);
          const trigger = U.qs(".ms");
          if (trigger) trigger.click();
        } else if (view === "app-profile-open") {
          const list = T.chat.chats();
          if (list && list[0]) T.chat.selectChat(list[0].id);
          const profTrigger = U.qs("#profileTrigger");
          if (profTrigger) profTrigger.click();
        }
      }
      return;
    }

    // Initial view resolution (standard)
    if (U.store.state.user) {
      document.body.classList.add("in-app");
      if (U.qs("#landing")) U.qs("#landing").hidden = true;
      if (U.qs("#auth")) U.qs("#auth").hidden = true;
      if (U.qs("#app")) {
        U.qs("#app").hidden = false;
        bootApp();
        requestAnimationFrame(() => U.qs("#app").classList.add("is-entered"));
      }
    } else {
      document.body.classList.remove("in-app");
      if (U.qs("#auth")) U.qs("#auth").hidden = true;
      if (U.qs("#app")) U.qs("#app").hidden = true;
      if (U.qs("#landing")) U.qs("#landing").hidden = false;
    }
  }

  T.app = { boot, logout, applyTheme, showLanding, showAuth, enterApp };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
