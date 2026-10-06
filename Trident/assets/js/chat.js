/* ============================================================================
   Trident — chat engine
   Thread store, markdown streaming, message actions, composer behaviour.
   ========================================================================== */
(function () {
  const T = (window.Trident = window.Trident || {});
  const U = T.ui;
  const I = T.icon;
  const esc = U.escape;

  const chat = {
    el: {},
    streaming: false,
    streamTimer: null,
    stick: true,
    listeners: [],
  };

  /* ── Store helpers ────────────────────────────────────────────────────── */
  function chats() {
    return U.store.state.chats || [];
  }
  function active() {
    return chats().find((c) => c.id === U.store.state.activeId) || null;
  }
  function save() {
    U.store.save();
    chat.listeners.forEach((fn) => fn());
  }
  function onChange(fn) {
    chat.listeners.push(fn);
  }

  function uid() {
    return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function seedIfEmpty() {
    if (chats().length) return;
    const now = Date.now();
    const seeded = T.data.SEED_THREADS.map((t, i) => ({
      id: uid() + i,
      title: t.title,
      model: t.model,
      createdAt: now - (i + 1) * 3600e3,
      updatedAt: now - (i + 1) * 3600e3,
      messages: t.messages.map((m, k) => ({ role: m.role, text: m.text, ts: now - (i + 1) * 3600e3 + k * 60e3 })),
    }));
    U.store.set({ chats: seeded, activeId: seeded[0].id });
  }

  function newChat() {
    const c = {
      id: uid(),
      title: "New thread",
      model: U.store.state.model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    U.store.set({ chats: [c].concat(chats()), activeId: c.id });
    save();
    render();
    if (chat.el.input) chat.el.input.focus();
  }

  function selectChat(id) {
    U.store.set({ activeId: id });
    save();
    render();
  }

  function removeChat(id) {
    const list = chats().filter((c) => c.id !== id);
    let activeId = U.store.state.activeId;
    if (activeId === id) activeId = list.length ? list[0].id : null;
    if (!list.length) {
      const c = {
        id: uid(),
        title: "New thread",
        model: U.store.state.model,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      list.push(c);
      activeId = c.id;
    }
    U.store.set({ chats: list, activeId });
    save();
    render();
  }

  /* ── Rendering ────────────────────────────────────────────────────────── */
  function avatarFor(role) {
    const user = U.store.state.user;
    if (role === "user") {
      const seed = (user && user.avatarSeed) || "trident";
      return T.avatar.svg(seed, { label: U.store.state.user ? T.avatar.initialsFrom(user.name) : "You" });
    }
    return I.trident(16, 1.9);
  }

  function messageMarkup(m, index) {
    const isUser = m.role === "user";
    const time = U.timeLabel(m.ts || Date.now());
    const found = T.data.findModel(m.model || (active() && active().model) || U.store.state.model);
    const body = isUser
      ? `<div class="bubble">${esc(m.text)}</div>`
      : `<div class="md">${U.markdown(m.text)}</div>`;

    const actions = isUser
      ? `<div class="msg__actions">
           <button class="icon-btn" type="button" data-act="copy" title="Copy"><span class="sr-only">Copy</span>${I.ui(
             "copy",
             15
           )}</button>
         </div>`
      : `<div class="msg__actions">
           <button class="icon-btn" type="button" data-act="copy" title="Copy">${I.ui("copy", 15)}</button>
           <button class="icon-btn" type="button" data-act="regen" title="Regenerate">${I.ui("refresh", 15)}</button>
           <button class="icon-btn" type="button" data-act="up" title="Good response">${I.ui("thumbUp", 15)}</button>
           <button class="icon-btn" type="button" data-act="down" title="Poor response">${I.ui(
             "thumbDown",
             15
           )}</button>
         </div>`;

    return (
      `<article class="msg${isUser ? " msg--user" : ""}" data-index="${index}">` +
      `<div class="msg__avatar${isUser ? "" : " msg__avatar--ai"}">${avatarFor(m.role)}</div>` +
      `<div class="msg__body">` +
      `<div class="msg__head">` +
      `<span class="msg__who">${isUser ? esc((U.store.state.user && U.store.state.user.name) || "You") : "Trident"}</span>` +
      (isUser ? "" : `<span class="msg__model">${I.logo(found.provider.logo, 12)}${esc(found.model.name)}</span>`) +
      `<span class="msg__time">${esc(time)}</span>` +
      `</div>` +
      body +
      actions +
      `</div></article>`
    );
  }

  function renderMessages() {
    const c = active();
    const host = chat.el.messages;
    const wrap = document.getElementById("composerWrap");
    if (!c || !c.messages.length) {
      host.innerHTML = "";
      chat.el.hero.classList.remove("is-hidden");
      if (wrap) wrap.classList.remove("is-docked");
      return;
    }
    chat.el.hero.classList.add("is-hidden");
    if (wrap) wrap.classList.add("is-docked");
    host.innerHTML = c.messages.map(messageMarkup).join("");
  }

  function renderSuggestions() {
    const c = active();
    // Once any message is sent, prompt suggestions do not show anymore
    if (c && c.messages && c.messages.length > 0) {
      chat.el.suggestions.innerHTML = "";
      chat.el.suggestions.style.display = "none";
      return;
    }
    chat.el.suggestions.style.display = "flex";
    chat.el.suggestions.innerHTML = T.data.SUGGESTIONS.initial
      .map(
        (s, i) =>
          `<button class="pill" type="button" data-suggest="${esc(s)}" style="animation-delay:${i * 45}ms">${esc(
            s
          )}</button>`
      )
      .join("");
  }

  function renderTopbar() {
    const c = active();
    chat.el.crumb.textContent = c ? c.title || "New thread" : "New thread";
    const found = T.data.findModel((c && c.model) || U.store.state.model);
    chat.el.badge.innerHTML = `${I.logo(found.provider.logo, 13)}${esc(found.model.name)}`;
  }

  function render() {
    renderMessages();
    renderSuggestions();
    renderTopbar();
    if (!chat.streaming) setStreamState(false);
    stickBottom(true);
  }

  /* ── Scrolling ────────────────────────────────────────────────────────── */
  function stickBottom(force) {
    const el = chat.el.scroll;
    if (!el) return;
    if (force || chat.stick) el.scrollTop = el.scrollHeight;
  }

  /* ── Sending ──────────────────────────────────────────────────────────── */
  function setStreamState(on) {
    chat.streaming = on;
    const btn = chat.el.send;
    btn.classList.toggle("is-stop", on);
    btn.innerHTML = on ? I.ui("stop", 14) : I.ui("arrowUp", 16);
    btn.disabled = on ? false : !chat.el.input.value.trim();
  }

  function stopStream() {
    if (chat.streamTimer) clearInterval(chat.streamTimer);
    chat.streamTimer = null;
    setStreamState(false);
  }

  function push(role, text, model) {
    const c = active();
    if (!c) return null;
    const msg = { role, text, ts: Date.now(), model };
    c.messages.push(msg);
    c.updatedAt = Date.now();
    return msg;
  }

  function send() {
    const text = chat.el.input.value.trim();
    if (!text || chat.streaming) return;
    let c = active();
    if (!c) newChat();
    c = active();

    const model = U.store.state.model;
    c.model = model;
    push("user", text, model);
    if (c.messages.length === 1) c.title = text.length > 46 ? text.slice(0, 46).trim() + "…" : text;

    chat.el.input.value = "";
    autoSize();
    renderMessages();
    renderSuggestions();
    renderTopbar();
    save();
    stickBottom(true);

    respond(text, model);
  }

  function respond(prompt, modelId) {
    const found = T.data.findModel(modelId);
    const reply = T.data.replyFor(prompt, found.model.name);

    const c = active();
    if (!c) return;

    // Typing indicator
    const typing = document.createElement("div");
    typing.className = "typing";
    typing.innerHTML =
      `<div class="msg__avatar msg__avatar--ai">${I.trident(16, 1.9)}</div>` +
      `<div class="typing__dots"><i></i><i></i><i></i></div>` +
      `<span class="typing__label">${esc(found.model.name)} is thinking…</span>`;
    chat.el.messages.appendChild(typing);
    stickBottom(true);

    setStreamState(true);

    setTimeout(() => {
      typing.remove();
      const msg = push("assistant", "", modelId);
      renderMessages();
      const nodes = chat.el.messages.querySelectorAll(".msg");
      const node = nodes[nodes.length - 1];
      const body = node.querySelector(".md");
      if (!body) return stopStream();

      node.classList.add("is-streaming");

      let i = 0;
      const step = Math.max(2, Math.round(reply.length / 110));
      chat.stick = true;
      chat.streamTimer = setInterval(() => {
        i = Math.min(reply.length, i + step);
        body.innerHTML = U.markdown(reply.slice(0, i)) + (i < reply.length ? '<span class="caret"></span>' : "");
        stickBottom(false);
        if (i >= reply.length) {
          clearInterval(chat.streamTimer);
          chat.streamTimer = null;
          node.classList.remove("is-streaming");
          msg.text = reply;
          setStreamState(false);
          save();
        }
      }, 18);
    }, 520);
  }

  function regenerate() {
    const c = active();
    if (!c || !c.messages.length || chat.streaming) return;
    // Trim to the last user message
    while (c.messages.length && c.messages[c.messages.length - 1].role !== "user") c.messages.pop();
    const last = c.messages[c.messages.length - 1];
    if (!last) return;
    renderMessages();
    respond(last.text, c.model || U.store.state.model);
  }

  /* ── Composer behaviour ───────────────────────────────────────────────── */
  function autoSize() {
    const el = chat.el.input;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }

  /* ── Wiring ───────────────────────────────────────────────────────────── */
  function init() {
    chat.el = {
      scroll: U.qs("#chatScroll"),
      messages: U.qs("#messages"),
      hero: U.qs("#hero"),
      suggestions: U.qs("#suggestions"),
      input: U.qs("#input"),
      send: U.qs("#sendBtn"),
      composer: U.qs("#composer"),
      crumb: U.qs("#topbarCrumb"),
      badge: U.qs("#topbarBadge"),
      attach: U.qs("#attachBtn"),
    };

    seedIfEmpty();

    // Icons that live in static markup
    const attach = chat.el.attach;
    if (attach) attach.innerHTML = I.ui("clip", 17);
    chat.el.send.innerHTML = I.ui("arrowUp", 16);

    U.on(chat.el.input, "input", () => {
      autoSize();
      if (!chat.streaming) chat.el.send.disabled = !chat.el.input.value.trim();
    });

    U.on(chat.el.input, "keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    U.on(chat.el.composer, "submit", (e) => {
      e.preventDefault();
      if (chat.streaming) stopStream();
      else send();
    });

    U.on(chat.el.send, "click", (e) => {
      e.preventDefault();
      if (chat.streaming) stopStream();
      else send();
    });

    U.on(chat.el.attach, "click", () => U.toast("Attachments arrive with the sync release", "clip"));

    U.on(chat.el.suggestions, "click", (e) => {
      const pill = e.target.closest("[data-suggest]");
      if (!pill) return;
      chat.el.input.value = pill.getAttribute("data-suggest");
      autoSize();
      chat.el.send.disabled = false;
      chat.el.input.focus();
    });

    U.on(chat.el.messages, "click", (e) => {
      const copyBtn = e.target.closest("[data-copy]");
      if (copyBtn) {
        const block = copyBtn.closest(".code");
        const code = block ? block.querySelector("code") : null;
        if (code) copy(code.textContent, "Code copied");
        return;
      }
      const act = e.target.closest("[data-act]");
      if (!act) return;
      const msgEl = act.closest(".msg");
      const index = +msgEl.getAttribute("data-index");
      const c = active();
      const msg = c && c.messages[index];
      const kind = act.getAttribute("data-act");

      if (kind === "copy") {
        copy(msg ? msg.text : "", "Copied to clipboard");
      } else if (kind === "regen") {
        regenerate();
      } else if (kind === "up" || kind === "down") {
        act.classList.toggle("is-on");
        U.toast(kind === "up" ? "Thanks — logged as good" : "Noted — we'll do better", "check");
      }
    });

    U.on(chat.el.scroll, "scroll", () => {
      const el = chat.el.scroll;
      chat.stick = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
    });

    render();
  }

  function copy(text, label) {
    const done = () => U.toast(label, "check");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => U.toast("Copy blocked by browser", "x"));
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (err) {
        U.toast("Copy blocked by browser", "x");
      }
      ta.remove();
    }
  }

  T.chat = {
    init,
    render,
    newChat,
    selectChat,
    removeChat,
    onChange,
    chats,
    active,
    setModel(id) {
      const c = active();
      if (c) c.model = id;
      U.store.set({ model: id });
      renderTopbar();
      save();
    },
  };
})();
