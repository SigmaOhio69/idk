/* ============================================================================
   Trident — procedural avatars
   Deterministic-from-seed SVG portraits: five generative styles across a
   curated palette set. No network, no assets, crisp at any size.
   ========================================================================== */
(function () {
  const T = (window.Trident = window.Trident || {});

  const PALETTES = [
    ["#0284c7", "#0ea5e9", "#38bdf8"],
    ["#0369a1", "#0891b2", "#67e8f9"],
    ["#0f766e", "#14b8a6", "#2dd4bf"],
    ["#10b981", "#0ea5e9", "#a7f3d0"],
    ["#1e293b", "#334155", "#38bdf8"],
    ["#0369a1", "#0284c7", "#e0f2fe"],
    ["#14b8a6", "#0284c7", "#99f6e4"],
    ["#0f172a", "#0284c7", "#38bdf8"],
    ["#22d3ee", "#0284c7", "#cffafe"],
    ["#059669", "#0ea5e9", "#a7f3d0"],
  ];

  const STYLES = ["aurora", "initials", "orbits", "shards", "waves"];
  let uid = 0;

  /* ── Seeded RNG (mulberry32) ──────────────────────────────────────────── */
  function hash(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }
  function rng(seed) {
    let a = hash(String(seed));
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(r, list) {
    return list[Math.floor(r() * list.length) % list.length];
  }

  /* ── Style renderers (100×100 canvas) ─────────────────────────────────── */
  function aurora(r, pal, id) {
    const blobs = [];
    for (let i = 0; i < 3; i++) {
      const cx = 18 + r() * 64;
      const cy = 16 + r() * 68;
      const rx = 22 + r() * 26;
      const ry = 18 + r() * 24;
      const rot = r() * 180;
      const color = i === 2 ? pal[2] : i === 1 ? pal[1] : pal[2];
      blobs.push(
        `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" ` +
          `fill="${color}" opacity="${(0.42 + r() * 0.3).toFixed(2)}" transform="rotate(${rot.toFixed(0)} ${cx.toFixed(
            1
          )} ${cy.toFixed(1)})"/>`
      );
    }
    return `<g filter="url(#blur-${id})">${blobs.join("")}</g>`;
  }

  function initials(r, pal, id, label) {
    const letters = (label || "TR").slice(0, 2).toUpperCase();
    return (
      `<text x="50" y="50" text-anchor="middle" dominant-baseline="central" ` +
      `font-family="Inter, system-ui, sans-serif" font-size="38" font-weight="700" ` +
      `letter-spacing="-1" fill="#ffffff" fill-opacity="0.95">${letters}</text>` +
      `<circle cx="50" cy="50" r="49" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="2"/>`
    );
  }

  function orbits(r, pal, id) {
    const out = [];
    const base = r() * 40;
    for (let i = 0; i < 4; i++) {
      const rx = 16 + i * 11 + r() * 4;
      const ry = 8 + i * 8 + r() * 3;
      out.push(
        `<ellipse cx="50" cy="50" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="none" ` +
          `stroke="${i % 2 ? "#ffffff" : pal[2]}" stroke-opacity="${(0.5 - i * 0.07).toFixed(2)}" ` +
          `stroke-width="${(2.4 - i * 0.35).toFixed(2)}" transform="rotate(${base.toFixed(0)} 50 50)"/>`
      );
    }
    out.push(`<circle cx="50" cy="50" r="${(5 + r() * 3).toFixed(1)}" fill="#ffffff" fill-opacity="0.92"/>`);
    return out.join("");
  }

  function shards(r, pal, id) {
    const out = [];
    const cx = 50;
    const cy = 50;
    const n = 6 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const a1 = (i / n) * Math.PI * 2 + r() * 0.35;
      const a2 = ((i + 1) / n) * Math.PI * 2 + r() * 0.35;
      const rad = 34 + r() * 34;
      const x1 = cx + Math.cos(a1) * rad;
      const y1 = cy + Math.sin(a1) * rad;
      const x2 = cx + Math.cos(a2) * (rad + r() * 22);
      const y2 = cy + Math.sin(a2) * (rad + r() * 22);
      out.push(
        `<path d="M${cx} ${cy} L${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} Z" ` +
          `fill="${i % 2 ? "#ffffff" : pal[2]}" fill-opacity="${(0.1 + r() * 0.28).toFixed(2)}"/>`
      );
    }
    return out.join("");
  }

  function waves(r, pal, id) {
    const out = [];
    for (let i = 0; i < 4; i++) {
      const y = 24 + i * 17 + r() * 6;
      const amp = 8 + r() * 12;
      const d =
        `M-5 ${y.toFixed(1)} C ${(20 + r() * 12).toFixed(1)} ${(y - amp).toFixed(1)}, ` +
        `${(60 + r() * 14).toFixed(1)} ${(y + amp).toFixed(1)}, 105 ${(y - amp * 0.35).toFixed(1)}`;
      out.push(
        `<path d="${d}" fill="none" stroke="${i % 2 ? "#ffffff" : pal[2]}" ` +
          `stroke-opacity="${(0.45 - i * 0.06).toFixed(2)}" stroke-width="${(5 - i * 0.6).toFixed(1)}" stroke-linecap="round"/>`
      );
    }
    return out.join("");
  }

  const RENDERERS = { aurora, initials, orbits, shards, waves };

  /**
   * Build an avatar SVG.
   * @param {string} seed   deterministic seed; same seed → same avatar
   * @param {object} opts   { size, label, style, ratio }
   */
  function svg(seed, opts) {
    const o = opts || {};
    const r = rng(seed == null ? "trident" : seed);
    const pal = PALETTES[Math.floor(r() * PALETTES.length) % PALETTES.length];
    const style = o.style && RENDERERS[o.style] ? o.style : STYLES[Math.floor(r() * STYLES.length) % STYLES.length];
    const id = "av" + ++uid;
    const angle = Math.floor(r() * 4) * 45 + 135;
    const body = RENDERERS[style](r, pal, id, o.label);
    const size = o.size ? ` width="${o.size}" height="${o.size}"` : "";

    return (
      `<svg viewBox="0 0 100 100"${size} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar">` +
      `<defs>` +
      `<linearGradient id="g-${id}" gradientTransform="rotate(${angle} 0.5 0.5)">` +
      `<stop offset="0%" stop-color="${pal[0]}"/><stop offset="100%" stop-color="${pal[1]}"/></linearGradient>` +
      `<radialGradient id="v-${id}" cx="30%" cy="22%" r="78%">` +
      `<stop offset="0%" stop-color="#ffffff" stop-opacity="0.26"/>` +
      `<stop offset="55%" stop-color="#ffffff" stop-opacity="0"/>` +
      `<stop offset="100%" stop-color="#000000" stop-opacity="0.28"/></radialGradient>` +
      `<filter id="blur-${id}" x="-30%" y="-30%" width="160%" height="160%">` +
      `<feGaussianBlur stdDeviation="9"/></filter>` +
      `</defs>` +
      `<rect width="100" height="100" fill="url(#g-${id})"/>` +
      body +
      `<rect width="100" height="100" fill="url(#v-${id})"/>` +
      `</svg>`
    );
  }

  function randomSeed() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function initialsFrom(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "TR";
    if (parts.length === 1) return parts[0].slice(0, 2);
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  T.avatar = { svg, randomSeed, initialsFrom, PALETTES, STYLES };
})();
