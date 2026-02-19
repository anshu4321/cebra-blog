import { useState, useEffect, useRef } from "react";
import {
  IMG_synthetic, IMG_reconstruction, IMG_hippocampus,
  IMG_decoding, IMG_trajectory, IMG_consistency,
  IMG_persistence, IMG_lifespans, IMG_circular,
} from "./imageData";

const IMAGES = {
  synthetic:      { src: IMG_synthetic,      label: "Synthetic Latent Recovery" },
  reconstruction: { src: IMG_reconstruction, label: "Reconstruction Scores" },
  hippocampus:    { src: IMG_hippocampus,    label: "Hippocampus Embeddings" },
  decoding:       { src: IMG_decoding,       label: "Decoding Performance" },
  trajectory:     { src: IMG_trajectory,     label: "Decoded Trajectory" },
  consistency:    { src: IMG_consistency,     label: "Cross-Subject Consistency" },
  persistence:    { src: IMG_persistence,    label: "Persistence Diagrams" },
  lifespans:      { src: IMG_lifespans,      label: "Cohomology Lifespans" },
  circular:       { src: IMG_circular,       label: "Circular Coordinates" },
};

const T = {
  bg: "#060b10", bgCard: "#0e1419", teal: "#64dcc8", tealDim: "#3a8f7d",
  coral: "#e74c6f", text: "rgba(200,215,220,0.85)", textDim: "rgba(200,215,220,0.5)",
  heading: "#e8f0ee", border: "rgba(100,220,200,0.12)",
};

function NeuronField() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let raf;
    const particles = [];
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < 50; i++) particles.push({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.8 + .8, phase: Math.random() * 6.28,
    });
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.phase += .012;
        if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28);
        ctx.fillStyle = `rgba(100,220,200,${.22 + .12 * Math.sin(p.phase)})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++)
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(100,220,200,${.045 * (1 - d / 130)})`;
            ctx.lineWidth = .5; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: .1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(32px)", transition: `all .7s cubic-bezier(.16,1,.3,1) ${delay}s` }}>{children}</div>;
}

function Figure({ imgKey, caption, wide }) {
  const [open, setOpen] = useState(false);
  const img = IMAGES[imgKey] || {};
  return <>
    <figure onClick={() => setOpen(true)} style={{ margin: wide ? "3rem 0" : "2.5rem 0", cursor: "zoom-in", borderRadius: "12px", overflow: "hidden", border: `1px solid ${T.border}`, background: "rgba(10,15,20,0.7)" }}>
      <img src={img.src} alt={caption || img.label} style={{ width: "100%", display: "block", transition: "transform .3s" }} onMouseOver={e => e.target.style.transform = "scale(1.008)"} onMouseOut={e => e.target.style.transform = "scale(1)"} />
      {caption && <figcaption style={{ padding: "14px 20px", fontFamily: "'Source Serif 4',Georgia,serif", fontSize: ".88rem", color: T.textDim, fontStyle: "italic", lineHeight: 1.5, borderTop: "1px solid rgba(100,220,200,0.06)" }}>{caption}</figcaption>}
    </figure>
    {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.93)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", backdropFilter: "blur(20px)" }}>
      <img src={img.src} alt={caption} style={{ maxWidth: "94vw", maxHeight: "92vh", borderRadius: "8px", boxShadow: "0 0 80px rgba(100,220,200,.1)" }} />
    </div>}
  </>;
}

function PullQuote({ children }) {
  return <blockquote style={{ margin: "3rem 0", padding: "2rem 2.5rem", borderLeft: "3px solid rgba(100,220,200,0.6)", background: "linear-gradient(135deg,rgba(100,220,200,0.04),rgba(100,220,200,0.01))", borderRadius: "0 12px 12px 0", fontFamily: "'Source Serif 4',Georgia,serif", fontSize: "1.25rem", lineHeight: 1.6, color: "rgba(200,230,225,0.9)", fontStyle: "italic" }}>{children}</blockquote>;
}

function Divider({ label }) {
  return <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", margin: "4rem 0 2.5rem" }}>
    <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,transparent,rgba(100,220,200,0.25),transparent)" }} />
    {label && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".68rem", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(100,220,200,0.45)", whiteSpace: "nowrap" }}>{label}</span>}
    <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,transparent,rgba(100,220,200,0.25),transparent)" }} />
  </div>;
}

function Stat({ value, label }) {
  return <div style={{ textAlign: "center", padding: "1.4rem 1rem", borderRadius: "12px", background: "rgba(100,220,200,0.04)", border: `1px solid ${T.border}` }}>
    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.9rem", fontWeight: 700, color: T.teal, lineHeight: 1, marginBottom: ".4rem" }}>{value}</div>
    <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: ".82rem", color: T.textDim }}>{label}</div>
  </div>;
}

function Code({ children }) {
  return <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".84em", background: "rgba(100,220,200,0.08)", color: T.teal, padding: "2px 7px", borderRadius: "4px", border: `1px solid ${T.border}` }}>{children}</code>;
}

function DebugNote({ title, children }) {
  return <div style={{ margin: "2rem 0", padding: "1.2rem 1.5rem", borderRadius: "10px", border: "1px solid rgba(231,76,111,0.2)", background: "rgba(231,76,111,0.04)" }}>
    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".68rem", letterSpacing: ".15em", textTransform: "uppercase", color: T.coral, marginBottom: ".5rem", display: "flex", alignItems: "center", gap: ".4rem" }}>
      <span style={{ fontSize: ".85rem" }}>🐛</span> {title}
    </div>
    <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: "1rem", lineHeight: 1.7, color: T.text }}>{children}</div>
  </div>;
}

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const P = ({ children }) => <p style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: "1.1rem", lineHeight: 1.85, color: T.text, marginBottom: "1.5rem" }}>{children}</p>;
  const H2 = ({ children }) => <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "2.1rem", fontWeight: 400, color: T.heading, marginBottom: "1.2rem", marginTop: ".5rem", lineHeight: 1.25 }}>{children}</h2>;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(100,220,200,0.3); color: #fff; }
        @keyframes heroGlow { 0%,100% { opacity:.35; } 50% { opacity:.65; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes typeIn { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <NeuronField />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* HERO */}
        <header style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle,rgba(100,220,200,0.06) 0%,transparent 70%)", top: "50%", left: "50%", transform: `translate(-50%,-50%) translateY(${scrollY * -.06}px)`, animation: "heroGlow 6s ease-in-out infinite", pointerEvents: "none" }} />

          <div style={{ animation: "fadeUp .9s ease-out .2s both", maxWidth: "800px" }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".68rem", letterSpacing: ".35em", textTransform: "uppercase", color: T.teal, marginBottom: "2rem", opacity: .75 }}>
              Computational Neuroscience · AI-Assisted Implementation · 2026
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "clamp(2.4rem,5.5vw,4.8rem)", fontWeight: 400, color: "#f0f8f6", lineHeight: 1.1, marginBottom: "1.5rem", animation: "typeIn 1s ease-out .5s both" }}>
              An A100, Claude, and{" "}
              <em style={{ color: T.teal, fontStyle: "italic" }}>Under Two Hours</em>
            </h1>
            <p style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: "1.2rem", color: "rgba(200,215,220,0.55)", maxWidth: "600px", lineHeight: 1.7, margin: "0 auto 2.5rem", animation: "typeIn 1s ease-out .8s both" }}>
              How I used an NVIDIA A100 and Claude to implement a Nature 2023 paper on neural latent embeddings — reproducing key results, debugging in real time, and decoding a rat's position from hippocampal neurons.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", animation: "typeIn 1s ease-out 1.1s both" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `linear-gradient(135deg,${T.teal},${T.tealDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 600, color: T.bg, fontFamily: "'Instrument Serif',serif" }}>N</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: "1rem", color: T.heading }}>Nayanika Biswas</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".68rem", color: "rgba(200,215,220,0.3)" }}>February 2026 · 14 min read</div>
              </div>
            </div>
          </div>

          <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", animation: "fadeUp 1s ease-out 1.8s both" }}>
            <svg width="20" height="28" viewBox="0 0 20 28" fill="none"><rect x="1" y="1" width="18" height="26" rx="9" stroke="rgba(100,220,200,0.25)" strokeWidth="1.5" /><circle cx="10" cy="9" r="2" fill={T.teal}><animate attributeName="cy" values="9;19;9" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="1;.3;1" dur="2s" repeatCount="indefinite" /></circle></svg>
          </div>
        </header>

        {/* ARTICLE */}
        <article style={{ maxWidth: "720px", margin: "0 auto", padding: "0 1.5rem 6rem" }}>

          <FadeIn><P>A few years ago, when I was still in college, a paper landed in <em>Nature</em> that made me stop scrolling. It was called <em>"Learnable latent embeddings for joint behavioural and neural analysis"</em> — better known by the name of its algorithm, <strong style={{ color: T.teal }}>CEBRA</strong>. The promise was extraordinary: a single method that could take the chaotic firing of thousands of neurons and distill it into a clean, low-dimensional picture of what an animal was actually <em>doing</em>.</P></FadeIn>

          <FadeIn><P>Last week, that day came. I opened Google Colab, connected to an NVIDIA A100, opened Claude in a browser tab, and started building.</P></FadeIn>

          <FadeIn><PullQuote>Claude didn't just help me write code — it read the paper, designed the notebook structure, and debugged errors faster than I could read the tracebacks. The A100 handled the training. I handled the chai.</PullQuote></FadeIn>

          <FadeIn><P>I gave Claude the paper and asked it to summarize the method. Within seconds it broke down the contrastive learning framework, the sampling strategies, the InfoNCE objective, and identified that CEBRA was already <Code>pip install</Code>-able. It proposed a four-section notebook and generated the entire thing. Was it perfect out of the box? No. And that's the interesting part.</P></FadeIn>

          <Divider label="The Bugs" />
          <FadeIn><H2>Real-time debugging with an AI co-pilot</H2></FadeIn>

          <FadeIn><P>The first error hit immediately. Claude had written <Code>total_mem</Code> but the correct PyTorch attribute is <Code>total_memory</Code>. One character. Fixed in one message.</P></FadeIn>
          <FadeIn><DebugNote title="Bug #1 — The attribute typo"><Code>total_mem</Code> → <Code>total_memory</Code>. The kind of thing that wastes 10 minutes on StackOverflow but takes Claude 2 seconds. This is where AI-assisted coding shines — not on the hard conceptual problems, but on the thousands of tiny friction points.</DebugNote></FadeIn>

          <FadeIn><P>The hippocampus data loader failed silently — CEBRA's API had evolved between versions. Claude rewrote it with four fallback methods: <Code>cebra.datasets.init()</Code>, <Code>cebra.load_data()</Code>, manual joblib download, and synthetic generation as a last resort.</P></FadeIn>
          <FadeIn><DebugNote title="Bug #2 — The data loader cascade">Rather than pinning a version, Claude built a cascade of four strategies. First one that works wins. If all fail, synthetic place cells are generated so the notebook still runs. Robust and pragmatic.</DebugNote></FadeIn>

          <FadeIn><P>Then the showstopper. The <Code>ripser</Code> topology cell hung for five minutes. CPU-only, O(n³) on 2000 points. Colab's interrupt button was unresponsive. Claude suggested: "drop to <Code>max_dim=1</Code> and <Code>n_subsample=800</Code>. β₁ is the one that proves the ring." After a forced restart and 15 minutes of retraining, the topology cell finished in 8 seconds.</P></FadeIn>
          <FadeIn><DebugNote title="Bug #3 — Ripser hangs on H₂">Persistent homology with <Code>max_dim=2</Code> is computationally explosive on CPU. The fix: drop to H₁ only, subsample to 800 points. Sometimes the best debugging is knowing what to safely skip.</DebugNote></FadeIn>

          <FadeIn><P>There was also a Colab session disconnect that wiped all variables. Claude diagnosed it instantly: "Those outputs are stale from the previous session. After a disconnect, the kernel resets but displayed outputs persist visually." A subtle trap that catches every Colab user eventually.</P></FadeIn>
          <FadeIn><P>Total debugging time across all issues: ~15 minutes. The rest was pure execution.</P></FadeIn>

          <Divider label="Part I" />
          <FadeIn><H2>What is CEBRA, and why should you care?</H2><P>Imagine eavesdropping on 100 neurons in a rat's hippocampus while it runs back and forth on a track. Each neuron fires at different rates depending on location — the famous "place cells." But with 100 neurons doing their own thing, the raw data is a 100-dimensional mess.</P></FadeIn>
          <FadeIn><P>PCA compresses it linearly. t-SNE and UMAP are nonlinear but inconsistent — run them twice, get different results. CEBRA uses <em>contrastive learning</em>: push similar neural snapshots together, push different ones apart. The result is a latent space where geometry <em>means something</em> — and it's consistent across animals and recording technologies.</P></FadeIn>

          <Divider label="Part II" />
          <FadeIn><H2>Synthetic ground truth</H2><P>Before touching real brain data, I generated synthetic neural activity with a known 2D latent passed through nonlinear mixing to 100 neurons with Poisson noise. Can CEBRA recover the original structure?</P></FadeIn>
          <FadeIn><Figure imgKey="synthetic" caption="Recovering ground truth latents. CEBRA produces a smooth, color-continuous embedding preserving the original structure, while PCA partially captures it and t-SNE/UMAP fragment the topology." wide /></FadeIn>
          <FadeIn><P>CEBRA recovers the latent as a clean continuous arc with the color gradient intact. PCA captures the rough shape but smears structure. UMAP and t-SNE do well locally but distort global geometry.</P></FadeIn>
          <FadeIn><Figure imgKey="reconstruction" caption="R² reconstruction scores. CEBRA leads at 0.76, demonstrating the highest linear recoverability of the true latent." /></FadeIn>

          <Divider label="Part III" />
          <FadeIn><H2>Into the hippocampus</H2><P>Real electrophysiology from rat CA1 — ~80 neurons recorded while the animal ran on a 1.6-meter linear track. I trained CEBRA in hypothesis mode (position + direction labels) and discovery mode (time only, no labels).</P></FadeIn>
          <FadeIn><Figure imgKey="hippocampus" caption="3D hippocampal embeddings. Top: hypothesis-driven models (P+D, Position, Direction). Bottom: CEBRA-Time, shuffled control, and P+D colored by running direction." wide /></FadeIn>
          <FadeIn><P>Position+direction produces two sweeping arcs forming a ring — one for each running direction. CEBRA-Time, with <em>no labels at all</em>, independently discovers a similar ring. The shuffled control? A featureless blob. Science working as intended.</P></FadeIn>
          <FadeIn><Figure imgKey="decoding" caption="Position decoding. CEBRA models achieve R² > 0.9 and MAE ~5 cm, dramatically outperforming PCA and the shuffled control." /></FadeIn>
          <FadeIn><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", margin: "2rem 0" }}><Stat value="~5cm" label="Position error (CEBRA)" /><Stat value=">0.9" label="Decoding R²" /><Stat value="~50cm" label="Shuffled control error" /></div></FadeIn>
          <FadeIn><Figure imgKey="trajectory" caption="Decoded trajectory (teal) overlaid on ground truth (gray). The kNN decoder tracks every lap with remarkable fidelity." wide /></FadeIn>

          <Divider label="Part IV" />
          <FadeIn><H2>Do different brains agree?</H2><P>I simulated "multiple subjects" by partitioning neurons into four groups and training CEBRA independently. Do the embeddings agree?</P></FadeIn>
          <FadeIn><Figure imgKey="consistency" caption="Cross-subject consistency. CEBRA: R² > 0.88 between all pairs. PCA: negatively correlated. The boxplot quantifies the dramatic gap." wide /></FadeIn>
          <FadeIn><P>CEBRA's matrix is uniformly deep red — every pair above 0.88. PCA is <em>negative</em>. Different PCA runs don't just disagree — they're actively anti-correlated.</P></FadeIn>
          <FadeIn><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "2rem 0" }}><Stat value="0.89" label="CEBRA cross-subject R²" /><Stat value="-0.29" label="PCA cross-subject R²" /></div></FadeIn>

          <Divider label="Part V" />
          <FadeIn><H2>Topology: proving the ring is real</H2><P>Persistent cohomology mathematically verifies the ring. A linear track should give β₀=1 (one component), β₁=1 (one loop). We inflate spheres around each point and track features that persist across scales.</P></FadeIn>
          <FadeIn><Figure imgKey="persistence" caption="Persistence diagrams. Points far from the diagonal are long-lived features. CEBRA models show clean H₁ loops." /></FadeIn>
          <FadeIn><Figure imgKey="lifespans" caption="Lifespan diagrams. CEBRA (P+D) has a dominant H₀ component and persistent H₁ loop — the ring topology expected." /></FadeIn>
          <FadeIn><P>Extracting the circular coordinate and plotting against true position confirms it: a clean monotonic mapping for CEBRA, random noise for shuffled.</P></FadeIn>
          <FadeIn><Figure imgKey="circular" caption="Circular coordinates vs position. CEBRA: smooth monotonic. Shuffled: structureless." wide /></FadeIn>

          <Divider label="Reflection" />
          <FadeIn><H2>What two hours and an AI taught me</H2><P>When I first read this paper in college, it felt unreachable — dense math, custom infrastructure, expensive recordings.</P></FadeIn>
          <FadeIn><P>What changed wasn't just <Code>pip install cebra</Code> or cloud GPUs. It was the workflow. Claude read the paper and designed the experiment. When <Code>total_mem</Code> should have been <Code>total_memory</Code>, it fixed it in seconds. When the data loader broke, it wrote four fallbacks. When ripser hung, it knew which parameters to cut. When Colab disconnected, it explained why the stale outputs were deceiving me.</P></FadeIn>
          <FadeIn><PullQuote>15 minutes debugging, 105 minutes of productive work. That's AI-assisted research — not replacing the scientist, but removing the friction between the question and the answer.</PullQuote></FadeIn>
          <FadeIn><P>Contrastive learning — "push similar things together, push different things apart" — is simple enough to explain to a child. Yet applied to neural recordings, it reveals the hidden geometry of cognition. Rings for linear tracks. The brain's spatial map, decoded from static.</P></FadeIn>
          <FadeIn><P>I started this project to learn a technique. I ended it feeling like I'd glimpsed something deeper about how minds — biological and artificial — organize the world. And I did it in less time than a long movie.</P></FadeIn>

          <Divider />
          <FadeIn><div style={{ padding: "1.8rem", borderRadius: "12px", background: "rgba(100,220,200,0.025)", border: "1px solid rgba(100,220,200,0.08)" }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".68rem", letterSpacing: ".15em", textTransform: "uppercase", color: "rgba(100,220,200,0.45)", marginBottom: ".8rem" }}>References</div>
            <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: ".9rem", lineHeight: 1.8, color: T.textDim }}>
              Schneider, Lee &amp; Mathis. <em>Learnable latent embeddings for joint behavioural and neural analysis.</em> Nature 617, 360–368 (2023)<br />
              CEBRA: <a href="https://cebra.ai/docs/" style={{ color: T.teal, textDecoration: "none" }}>cebra.ai/docs</a>{" · "}<a href="https://github.com/AdaptiveMotorControlLab/CEBRA" style={{ color: T.teal, textDecoration: "none" }}>GitHub</a><br />
              Grosmark &amp; Buzsáki. <em>Diversity in neural firing dynamics...</em> Science 351, 1440–1443 (2016)
            </div>
          </div></FadeIn>

          <div style={{ textAlign: "center", marginTop: "3.5rem", fontFamily: "'JetBrains Mono',monospace", fontSize: ".68rem", color: "rgba(200,215,220,0.18)", letterSpacing: ".08em" }}>
            Written by Nayanika Biswas · February 2026<br />
            Built with CEBRA, an A100, Claude, and an unreasonable amount of chai
          </div>
        </article>
      </div>
    </div>
  );
}
