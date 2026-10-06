/* ============================================================================
   Trident — shared utilities: store, toasts, markdown, popover anchoring
   ========================================================================== */
(function () {
  const T = (window.Trident = window.Trident || {});
  const I = T.icon;

  /* ── DOM helpers ──────────────────────────────────────────────────────── */
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function on(el, ev, fn, opts) {
    if (el) el.addEventListener(ev, fn, opts);
    return () => el && el.removeEventListener(ev, fn, opts);
  }
  function escape(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  /* ── Persistent store ─────────────────────────────────────────────────── */
  const KEY = "trident.state.v1";

  function defaults() {
    return {
      ui: {
        theme: "dark",
        sidebar: { collapsed: false, width: 280, groups: { threads: true, team: false } },
      },
      user: null,
      model: T.data.DEFAULT_MODEL,
      pinned: [],
      chats: [],
      activeId: null,
    };
  }

  const store = {
    state: defaults(),
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.state = Object.assign(defaults(), parsed);
          this.state.ui = Object.assign(defaults().ui, parsed && parsed.ui);
          this.state.ui.sidebar = Object.assign(defaults().ui.sidebar, parsed && parsed.ui && parsed.ui.sidebar);
        }
      } catch (e) {
        this.state = defaults();
      }
      return this.state;
    },
    save() {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.state));
      } catch (e) {
        /* storage unavailable — session-only is acceptable */
      }
    },
    set(patch) {
      Object.assign(this.state, patch);
      this.save();
    },
    reset() {
      this.state = defaults();
      this.save();
    },
  };

  /* ── Toasts ───────────────────────────────────────────────────────────── */
  function toast(message, iconName) {
    const host = qs("#toasts");
    if (!host) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML =
      `<span class="toast__icon">${I.ui(iconName || "check", 16)}</span><span>${escape(message)}</span>`;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-in"));
    setTimeout(() => {
      el.classList.remove("is-in");
      setTimeout(() => el.remove(), 260);
    }, 2200);
  }

  /* ── Markdown (deliberately small, escape-first) ──────────────────────── */
  function inline(text) {
    return text
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => {
        const safe = /^(https?:|mailto:|#|\/)/i.test(href) ? href : "#";
        return `<a href="${safe}" target="_blank" rel="noreferrer noopener">${label}</a>`;
      })
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  }

  /* Lightweight syntax tokeniser for code blocks */
  function highlightCode(raw, lang) {
    let s = raw.replace(/^\n+|\n+$/g, "");
    // Extract strings & comments first into safe placeholders
    const tokens = [];
    s = s.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|&quot;[\s\S]*?&quot;|&#39;[\s\S]*?&#39;|`[\s\S]*?`)/g, (m) => {
      const idx = tokens.length;
      const isStr = m.startsWith("&quot;") || m.startsWith("&#39;") || m.startsWith("`");
      tokens.push(`<span class="${isStr ? "syn-str" : "syn-com"}">${m}</span>`);
      return `\u0000T${idx}\u0000`;
    });
    // Keywords
    s = s.replace(/\b(const|let|var|function|return|if|else|switch|case|break|default|import|export|from|async|await|class|interface|type|fn|pub|mut|impl|struct|enum|match|use|self|true|false|null|undefined)\b/g, '<span class="syn-kw">$1</span>');
    // Types & builtins
    s = s.replace(/\b(String|Map|Set|Array|Promise|Number|Boolean|Vec|Option|Result|Some|None|Ok|Err|u32|i32|usize)\b/g, '<span class="syn-typ">$1</span>');
    // Functions
    s = s.replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span class="syn-fn">$1</span>');
    // Numbers
    s = s.replace(/\b(\d+)\b/g, '<span class="syn-num">$1</span>');
    // Restore strings and comments
    s = s.replace(/\u0000T(\d+)\u0000/g, (_, i) => tokens[Number(i)]);
    return s;
  }

  function markdown(src) {
    let text = escape(src).replace(/\r\n/g, "\n");
    const blocks = [];
    const codes = [];

    // Fenced code blocks → placeholders
    text = text.replace(/```([a-zA-Z0-9+#-]*)\n?([\s\S]*?)```/g, (m, lang, code) => {
      const i = blocks.length;
      blocks.push(
        `<div class="code"><div class="code__head"><span class="code__lang">${escape(lang || "text")}</span>` +
          `<button class="code__copy" type="button" data-copy>${I.ui("copy", 13)}<span>Copy</span></button></div>` +
          `<pre><code>${highlightCode(code, lang)}</code></pre></div>`
      );
      return `\u0000B${i}\u0000`;
    });

    // Inline code → placeholders
    text = text.replace(/`([^`\n]+)`/g, (m, c) => {
      const i = codes.length;
      codes.push(`<code>${c}</code>`);
      return `\u0000C${i}\u0000`;
    });

    const out = [];
    text.split(/\n{2,}/).forEach((chunkRaw) => {
      const chunk = chunkRaw.trim();
      if (!chunk) return;

      const lines = chunk.split("\n");

      // Headings
      if (/^#{1,4}\s+/.test(chunk)) {
        out.push(`<h3>${inline(chunk.replace(/^#{1,4}\s+/, ""))}</h3>`);
        return;
      }
      // Horizontal rule
      if (/^(-{3,}|\*{3,})$/.test(chunk)) {
        out.push("<hr/>");
        return;
      }
      // Blockquote
      if (lines.every((l) => /^\s*&gt;\s?/.test(l))) {
        out.push(`<blockquote>${inline(lines.map((l) => l.replace(/^\s*&gt;\s?/, "")).join(" "))}</blockquote>`);
        return;
      }
      // Lists
      if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
        out.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ""))}</li>`).join("")}</ul>`);
        return;
      }
      if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
        out.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+\.\s+/, ""))}</li>`).join("")}</ol>`);
        return;
      }
      out.push(`<p>${inline(chunk)}</p>`);
    });

    let html = out.join("");
    html = html.replace(/\u0000B(\d+)\u0000/g, (m, i) => blocks[+i]);
    html = html.replace(/\u0000C(\d+)\u0000/g, (m, i) => codes[+i]);
    return html;
  }

  /* ── Popover anchoring (fixed, flips when short on space) ─────────────── */
  function anchorBottom(panel, trigger, gap) {
    const r = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 12;
    const g = gap == null ? 10 : gap;

    const width = panel.offsetWidth || 320;
    const height = panel.offsetHeight || 380;

    let x = clamp(r.left, pad, Math.max(pad, vw - width - pad));

    // Prefer above the trigger; flip below when there is not enough headroom above
    let flip = false;
    if (r.top - g - height < pad) flip = true;

    const y = flip ? Math.max(pad, vh - (r.bottom + g + height)) : vh - r.top + g;

    panel.style.setProperty("--x", Math.round(x) + "px");
    panel.style.setProperty("--y", Math.round(y) + "px");
    panel.classList.toggle("is-flipped", flip);
    return { x, y, flip };
  }

  /* ── Time ─────────────────────────────────────────────────────────────── */
  function timeLabel(d) {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  function relative(ts) {
    const diff = Date.now() - ts;
    const mins = Math.round(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + "h ago";
    const days = Math.round(hrs / 24);
    if (days < 7) return days + "d ago";
    return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
  }

  T.ui = { qs, qsa, on, escape, clamp, store, toast, markdown, anchorBottom, timeLabel, relative };
})();
