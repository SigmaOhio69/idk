/* ============================================================================
   Trident — domain data
   Provider/model catalogue, suggestion sets, seeded threads, reply engine.
   ========================================================================== */
(function () {
  const T = (window.Trident = window.Trident || {});

  /* ── Provider catalogue ───────────────────────────────────────────────── */
  const PROVIDERS = [
    {
      id: "anthropic",
      name: "Anthropic",
      logo: "anthropic",
      sub: "Claude family",
      models: [
        {
          id: "claude-opus-4-5",
          name: "Claude Opus 4.5",
          desc: "Deepest reasoning for hard, multi-step problems and long agentic runs.",
          tags: [
            { icon: "spark", label: "Reasoning" },
            { icon: "eye", label: "Vision" },
            { icon: "layers", label: "200K" },
          ],
        },
        {
          id: "claude-sonnet-4-5",
          name: "Claude Sonnet 4.5",
          desc: "Balanced speed and depth — the dependable everyday default.",
          tags: [
            { icon: "zap", label: "Fast" },
            { icon: "eye", label: "Vision" },
            { icon: "layers", label: "200K" },
          ],
        },
        {
          id: "claude-haiku-4-5",
          name: "Claude Haiku 4.5",
          desc: "Near-instant responses built for high-volume, low-latency work.",
          tags: [
            { icon: "zap", label: "Fastest" },
            { icon: "eye", label: "Vision" },
            { icon: "layers", label: "200K" },
          ],
        },
      ],
    },
    {
      id: "openai",
      name: "OpenAI",
      logo: "openai",
      sub: "GPT & o-series",
      models: [
        {
          id: "gpt-5-1",
          name: "GPT-5.1",
          desc: "Frontier general model with adaptive thinking and broad tool use.",
          tags: [
            { icon: "spark", label: "Reasoning" },
            { icon: "eye", label: "Vision" },
            { icon: "layers", label: "400K" },
          ],
        },
        {
          id: "gpt-5-1-mini",
          name: "GPT-5.1 mini",
          desc: "Cost-efficient variant that keeps most of the flagship capability.",
          tags: [
            { icon: "zap", label: "Fast" },
            { icon: "eye", label: "Vision" },
          ],
        },
        {
          id: "o4-mini",
          name: "o4-mini",
          desc: "Lightweight reasoning model tuned for maths, logic and structured output.",
          tags: [
            { icon: "spark", label: "Reasoning" },
            { icon: "zap", label: "Cheap" },
          ],
        },
        {
          id: "gpt-4-1",
          name: "GPT-4.1",
          desc: "Stable workhorse with strong instruction following and long context.",
          tags: [
            { icon: "code", label: "Code" },
            { icon: "layers", label: "1M" },
          ],
        },
      ],
    },
    {
      id: "google",
      name: "Google",
      logo: "google",
      sub: "Gemini",
      models: [
        {
          id: "gemini-3-pro",
          name: "Gemini 3 Pro",
          desc: "Long-context multimodal reasoning across text, image, audio and video.",
          tags: [
            { icon: "spark", label: "Reasoning" },
            { icon: "eye", label: "Multimodal" },
            { icon: "layers", label: "1M" },
          ],
        },
        {
          id: "gemini-3-flash",
          name: "Gemini 3 Flash",
          desc: "Low-latency multimodal model sized for production traffic.",
          tags: [
            { icon: "zap", label: "Fast" },
            { icon: "eye", label: "Multimodal" },
          ],
        },
        {
          id: "gemini-25-flash-lite",
          name: "Gemini 2.5 Flash-Lite",
          desc: "Smallest multimodal model — cheapest cost per token.",
          tags: [
            { icon: "zap", label: "Cheap" },
            { icon: "eye", label: "Multimodal" },
          ],
        },
      ],
    },
    {
      id: "meta",
      name: "Meta",
      logo: "meta",
      sub: "Llama",
      models: [
        {
          id: "llama-4-behemoth",
          name: "Llama 4 Behemoth",
          desc: "Largest open-weight model in the Llama 4 family.",
          tags: [
            { icon: "star", label: "Open weights" },
            { icon: "spark", label: "Reasoning" },
          ],
        },
        {
          id: "llama-4-maverick",
          name: "Llama 4 Maverick",
          desc: "General-purpose open model with unusually strong code performance.",
          tags: [
            { icon: "star", label: "Open weights" },
            { icon: "code", label: "Code" },
          ],
        },
        {
          id: "llama-4-scout",
          name: "Llama 4 Scout",
          desc: "Ultra-long-context open model for large-document workloads.",
          tags: [
            { icon: "star", label: "Open weights" },
            { icon: "layers", label: "1M" },
          ],
        },
      ],
    },
    {
      id: "xai",
      name: "xAI",
      logo: "xai",
      sub: "Grok",
      models: [
        {
          id: "grok-4-1",
          name: "Grok 4.1",
          desc: "Flagship model with native tool use and deep multi-step reasoning.",
          tags: [
            { icon: "spark", label: "Reasoning" },
            { icon: "globe", label: "Tools" },
          ],
        },
        {
          id: "grok-4-fast",
          name: "Grok 4 Fast",
          desc: "Low-latency Grok tuned for chat-scale traffic.",
          tags: [
            { icon: "zap", label: "Fast" },
            { icon: "globe", label: "Tools" },
          ],
        },
        {
          id: "grok-vision",
          name: "Grok Vision",
          desc: "Image, chart and screenshot understanding with grounded answers.",
          tags: [{ icon: "eye", label: "Vision" }],
        },
      ],
    },
    {
      id: "mistral",
      name: "Mistral",
      logo: "mistral",
      sub: "Mistral & Codestral",
      models: [
        {
          id: "mistral-large-3",
          name: "Mistral Large 3",
          desc: "Frontier Mistral model with strong multilingual and function calling.",
          tags: [
            { icon: "spark", label: "Reasoning" },
            { icon: "globe", label: "Multilingual" },
          ],
        },
        {
          id: "mistral-medium-3",
          name: "Mistral Medium 3",
          desc: "Mid-tier balance of capability and cost.",
          tags: [{ icon: "zap", label: "Fast" }],
        },
        {
          id: "codestral-2",
          name: "Codestral 2",
          desc: "Code-specialised model with fill-in-the-middle completions.",
          tags: [
            { icon: "code", label: "Code" },
            { icon: "zap", label: "Fast" },
          ],
        },
        {
          id: "ministral-8b",
          name: "Ministral 8B",
          desc: "Edge-deployable 8B model for on-device inference.",
          tags: [
            { icon: "zap", label: "Cheap" },
            { icon: "star", label: "Open weights" },
          ],
        },
      ],
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      logo: "deepseek",
      sub: "V & R series",
      models: [
        {
          id: "deepseek-v32",
          name: "DeepSeek-V3.2",
          desc: "General model with unusually strong maths and code benchmarks.",
          tags: [
            { icon: "code", label: "Code" },
            { icon: "spark", label: "Reasoning" },
          ],
        },
        {
          id: "deepseek-r2",
          name: "DeepSeek-R2",
          desc: "Chain-of-thought reasoning model for hard analytical work.",
          tags: [{ icon: "spark", label: "Reasoning" }],
        },
        {
          id: "deepseek-coder-v3",
          name: "DeepSeek-Coder-V3",
          desc: "Repository-scale code generation and refactoring.",
          tags: [{ icon: "code", label: "Code" }],
        },
      ],
    },
    {
      id: "qwen",
      name: "Qwen",
      logo: "qwen",
      sub: "Qwen3",
      models: [
        {
          id: "qwen3-max",
          name: "Qwen3-Max",
          desc: "Largest Qwen3 model — strong across Chinese, English and code.",
          tags: [
            { icon: "globe", label: "Multilingual" },
            { icon: "spark", label: "Reasoning" },
          ],
        },
        {
          id: "qwen3-235b",
          name: "Qwen3-235B",
          desc: "Open-weight mixture-of-experts with 235B total parameters.",
          tags: [{ icon: "star", label: "Open weights" }],
        },
        {
          id: "qwen3-coder",
          name: "Qwen3-Coder",
          desc: "Agentic coding model with repository-scale context.",
          tags: [
            { icon: "code", label: "Code" },
            { icon: "layers", label: "1M" },
          ],
        },
      ],
    },
    {
      id: "perplexity",
      name: "Perplexity",
      logo: "perplexity",
      sub: "Sonar",
      models: [
        {
          id: "sonar-pro",
          name: "Sonar Pro",
          desc: "Grounded answers with live web search and inline citations.",
          tags: [
            { icon: "globe", label: "Search" },
            { icon: "file", label: "Citations" },
          ],
        },
        {
          id: "sonar",
          name: "Sonar",
          desc: "Fast grounded search model for factual lookups.",
          tags: [
            { icon: "globe", label: "Search" },
            { icon: "zap", label: "Fast" },
          ],
        },
        {
          id: "sonar-deep-research",
          name: "Sonar Deep Research",
          desc: "Multi-step research that returns sourced, structured reports.",
          tags: [
            { icon: "globe", label: "Search" },
            { icon: "spark", label: "Reasoning" },
          ],
        },
      ],
    },
  ];

  const DEFAULT_MODEL = "claude-opus-4-5";

  function findModel(id) {
    for (const p of PROVIDERS) {
      for (const m of p.models) {
        if (m.id === id) return { provider: p, model: m };
      }
    }
    return { provider: PROVIDERS[0], model: PROVIDERS[0].models[0] };
  }

  function providerOfModel(id) {
    return findModel(id).provider;
  }

  /* ── Suggestions ──────────────────────────────────────────────────────── */
  const SUGGESTIONS = {
    initial: [
      "Write a Rust async rate limiter with burst support",
      "Compare transformer and state-space architectures",
      "Debug why my React component re-renders twice",
      "Draft a launch email for a developer tool",
    ],
    followUp: [
      "Show me a simpler version",
      "Explain the trade-offs involved",
      "Add tests for the edge cases",
      "What does this cost at scale?",
    ],
  };

  /* ── Seeded threads ───────────────────────────────────────────────────── */
  const SEED_THREADS = [
    {
      title: "Streaming SSE backpressure",
      model: "claude-opus-4-5",
      messages: [
        { role: "user", text: "Our SSE endpoint stalls once clients fall behind. How do I apply backpressure?" },
        {
          role: "assistant",
          text:
            "The stall is almost always a full kernel send buffer — the server keeps writing into a socket the client is no longer draining.\n\n" +
            "### Three fixes, cheapest first\n\n" +
            "- **Bound the queue.** Give every subscriber a finite buffer (32–64 events). When it is full, drop or coalesce rather than block.\n" +
            "- **Check the write.** If `write()` returns short or `EAGAIN`, stop generating and resume on drain.\n" +
            "- **Coalesce by key.** For state-shaped events, keep only the latest value per key.\n\n" +
            "```ts\n" +
            "const pending = new Map<string, unknown>();\n" +
            "let flushed = 0;\n\n" +
            "function enqueue(key: string, value: unknown) {\n" +
            "  pending.set(key, value);\n" +
            "  if (flushed >= MAX_IN_FLIGHT) return; // backpressure signal\n" +
            "  flush();\n" +
            "}\n```\n\n" +
            "With a bounded queue the slow client degrades to *stale but live* instead of freezing the whole stream.",
        },
      ],
    },
    {
      title: "Postgres index not being used",
      model: "gpt-5-1",
      messages: [
        { role: "user", text: "Why does Postgres ignore my composite index on (tenant_id, created_at)?" },
        {
          role: "assistant",
          text:
            "Three usual causes:\n\n" +
            "1. **Column order.** A composite index only helps if the query constrains a prefix. Filtering on `created_at` alone cannot use `(tenant_id, created_at)`.\n" +
            "2. **Type mismatch.** Comparing a `bigint` column to a string literal suppresses the index unless the cast is on the literal side.\n" +
            "3. **Selectivity.** If the predicate matches more than roughly 5–10% of rows, a sequential scan genuinely is cheaper.\n\n" +
            "Run `EXPLAIN (ANALYZE, BUFFERS)` and compare `rows` versus `rows removed by filter` — that gap is the tell.",
        },
      ],
    },
    {
      title: "Naming a developer tool",
      model: "sonar-pro",
      messages: [{ role: "user", text: "Give me ten short names for a CLI that inspects container images." }],
    },
    {
      title: "Rust ownership mental model",
      model: "gemini-3-pro",
      messages: [
        { role: "user", text: "Explain Rust ownership like I already know C++ RAII." },
      ],
    },
  ];

  /* ── Reply engine (offline, deterministic-ish) ────────────────────────── */
  function codeReply(prompt) {
    return (
      "Here's a compact implementation. I kept it dependency-free so it drops straight into a service module.\n\n" +
      "```rust\n" +
      "use std::collections::VecDeque;\n" +
      "use std::time::{Duration, Instant};\n\n" +
      "/// Token bucket: `capacity` bursts, refilled at `rate` tokens/sec.\n" +
      "pub struct RateLimiter {\n" +
      "    capacity: u32,\n" +
      "    tokens: f64,\n" +
      "    rate: f64,\n" +
      "    last: Instant,\n" +
      "    waiters: VecDeque<Instant>,\n" +
      "}\n\n" +
      "impl RateLimiter {\n" +
      "    pub fn new(capacity: u32, rate: f64) -> Self {\n" +
      "        Self { capacity, tokens: capacity as f64, rate, last: Instant::now(), waiters: VecDeque::new() }\n" +
      "    }\n\n" +
      "    pub fn try_acquire(&mut self) -> bool {\n" +
      "        self.refill();\n" +
      "        if self.tokens >= 1.0 {\n" +
      "            self.tokens -= 1.0;\n" +
      "            true\n" +
      "        } else {\n" +
      "            false\n" +
      "        }\n" +
      "    }\n\n" +
      "    fn refill(&mut self) {\n" +
      "        let now = Instant::now();\n" +
      "        let elapsed = now.duration_since(self.last).as_secs_f64();\n" +
      "        self.tokens = (self.tokens + elapsed * self.rate).min(self.capacity as f64);\n" +
      "        self.last = now;\n" +
      "    }\n" +
      "}\n```\n\n" +
      "**Two things worth noting.** The bucket refills lazily on access instead of on a timer, so an idle limiter costs nothing. " +
      "And `try_acquire` never blocks — callers decide whether to queue, shed, or retry with jitter.\n\n" +
      "Want me to add a `tokio` variant that sleeps until a token is available?"
    );
  }

  function compareReply() {
    return (
      "Short version: transformers buy you accuracy and parallelism; state-space models buy you linear cost on long sequences.\n\n" +
      "### Where each wins\n\n" +
      "- **Transformers** — attention is a dense, content-based lookup, so copying, retrieval and in-context reasoning are strong. Cost is quadratic in sequence length, memory grows with the KV cache.\n" +
      "- **State-space / linear attention** — a fixed-size recurrent state, so cost per token is constant and memory is flat. The cost is fidelity: recalling an exact token from 100k steps back is harder.\n\n" +
      "### Practical read\n\n" +
      "```text\n" +
      "context   < 8k    → transformer, no contest\n" +
      "context   8k–128k → transformer with efficient attention\n" +
      "context   > 128k  → hybrid: SSM backbone + sparse attention layers\n" +
      "```\n\n" +
      "Hybrids are where production systems have landed — an SSM backbone for bulk sequence mixing, with a few attention layers reinserted at intervals to recover exact recall.\n\n" +
      "If you tell me your sequence lengths and latency budget I can narrow this to one architecture."
    );
  }

  function debugReply() {
    return (
      "A double render in React almost always comes from one of three places.\n\n" +
      "1. **`StrictMode`.** In development it intentionally mounts, unmounts and remounts every component to surface impure effects. This is expected — it does not happen in production builds.\n" +
      "2. **Unstable effect dependencies.** An object or array literal in the dependency array is a new reference every render, so the effect re-runs forever.\n" +
      "3. **State set during render.** Calling a setter in the render body (rather than in an event or effect) forces an immediate second pass.\n\n" +
      "```jsx\n" +
      "// ✗ new object every render → effect loop\n" +
      "useEffect(() => { load(options) }, [{ page, size }]);\n\n" +
      "// ✓ primitives, or memoise the object\n" +
      "useEffect(() => { load({ page, size }) }, [page, size]);\n" +
      "```\n\n" +
      "Drop a `console.count('render')` at the top of the component: if it fires twice only in dev, it's StrictMode — leave it alone."
    );
  }

  function genericReply(prompt, modelName) {
    const trimmed = prompt.length > 120 ? prompt.slice(0, 120).trim() + "…" : prompt;
    return (
      `Good question — here's how I'd approach it.\n\n` +
      `You asked: *${trimmed}*\n\n` +
      "### Framing\n\n" +
      "The useful move here is to separate the part that is **fixed** from the part that is **cheap to change later**. " +
      "Lock down the interface and the data shape; leave implementation detail swappable.\n\n" +
      "### A concrete plan\n\n" +
      "1. Write the smallest version that produces a correct result — no abstractions yet.\n" +
      "2. Instrument it: latency, error rate, and the one metric that tells you it worked.\n" +
      "3. Only then extract the abstraction, once two real call sites force the shape.\n\n" +
      "> Premature abstraction costs more than duplication, because it freezes a guess.\n\n" +
      `I'm answering this as **${modelName}** — switch providers from the picker in the composer if you want a second opinion on the same prompt.`
    );
  }

  function replyFor(prompt, modelName) {
    const p = String(prompt || "").toLowerCase();
    if (/rust|rate limit|token bucket|implement|write a |write me|function|class /.test(p)) return codeReply(prompt);
    if (/compare|versus|vs\.?\b|difference between/.test(p)) return compareReply();
    if (/debug|re-render|rerender|why does|error|fails?|stall/.test(p)) return debugReply();
    if (/name|launch email|draft/.test(p))
      return (
        "Here are ten short, trademark-safe candidates — all under seven characters, all pronounceable:\n\n" +
        "1. **Hull** — the shell of the image\n2. **Bilge** — what you pump out\n3. **Keel** — the structural spine\n4. **Sondr** — to probe depth\n5. **Ladle** — scoops layers out\n" +
        "6. **Porthole** — a view inside\n7. **Dredge** — pulls up what's buried\n8. **Fathom** — measure the depth\n9. **Tar** — archive, and a sailor\n10. **Kraken** — the thing in the layers\n\n" +
        "My pick is **Fathom**: it reads as measurement rather than destruction, and `fathom inspect nginx:latest` parses well.\n\n" +
        "Want variants that lean more serious, or more playful?"
      );
    if (/ownership|explain|what is|how does/.test(p))
      return (
        "Think of ownership as RAII with a *single* enforcing owner, checked at compile time.\n\n" +
        "### The three rules\n\n" +
        "- **One owner.** Every value has exactly one binding responsible for dropping it. Assignment *moves*; the old binding is dead.\n" +
        "- **Borrow, don't move.** `&T` is shared-read, `&mut T` is exclusive. The exclusivity is the whole point — it is what makes data races unrepresentable.\n" +
        "- **Lifetimes are constraints, not annotations.** You are telling the compiler how long a borrow must remain valid; it verifies the claim.\n\n" +
        "```rust\n" +
        "let s = String::from(\"hi\");\n" +
        "let r = &s;          // immutable borrow\n" +
        "// let m = &mut s;   // ✗ cannot mutably borrow while `r` lives\n" +
        "println!(\"{r}\");     // last use of `r`\n" +
        "let m = &mut s;      // ✓ borrow region ended\n" +
        "```\n\n" +
        "The advance over C++ isn't the destructor — you already have that. It's that the compiler proves no dangling reference can exist, " +
        "so `use-after-free` moves from a runtime crash to a build error."
      );
    return genericReply(prompt, modelName);
  }

  T.data = {
    PROVIDERS,
    DEFAULT_MODEL,
    SUGGESTIONS,
    SEED_THREADS,
    findModel,
    providerOfModel,
    replyFor,
  };
})();
