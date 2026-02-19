# An A100, Claude, and Under Two Hours

**Implementing a Nature 2023 paper on neural latent embeddings from scratch — and writing about it.**

This repo contains a blog post documenting the end-to-end implementation of [CEBRA](https://cebra.ai) (Schneider, Lee & Mathis, *Nature* 2023) using an NVIDIA A100 GPU and Claude as an AI co-pilot. The entire implementation — from reading the paper to verified topological analysis — was completed in under 2 hours.

🔗 **Live site**: *[your-vercel-url.vercel.app]*

---

## What is CEBRA?

CEBRA (**C**onsistent **E**m**B**eddings of high-dimensional **R**ecordings using **A**uxiliary variables) is a contrastive learning method for producing low-dimensional embeddings of neural population activity. Unlike PCA, t-SNE, or UMAP, CEBRA produces embeddings that are:

- **Behaviourally meaningful** — geometry in the latent space corresponds to real behavioral variables
- **Consistent across subjects** — different animals with different neurons produce alignable embeddings
- **Consistent across modalities** — electrophysiology and calcium imaging yield the same latent structure

The method uses the InfoNCE contrastive objective to train a neural network encoder, with positive pairs sampled based on behavioral similarity (supervised mode) or temporal proximity (self-supervised mode).

**Paper**: Schneider, S., Lee, J.H. & Mathis, M.W. *Learnable latent embeddings for joint behavioural and neural analysis.* Nature 617, 360–368 (2023). [doi:10.1038/s41586-023-06031-6](https://doi.org/10.1038/s41586-023-06031-6)

---

## What we implemented

The project reproduces five key results from the paper using rat hippocampal place cell recordings:

### 1. Synthetic benchmark
Generated 100-neuron Poisson spiking data from a known 2D latent with nonlinear mixing. Compared CEBRA, PCA, UMAP, and t-SNE on ground truth recovery. CEBRA achieved the highest reconstruction R² (0.76).

### 2. Hippocampal place cell embeddings
Trained four CEBRA variants on CA1 electrophysiology data (Grosmark & Buzsáki, 2016):
- **CEBRA-Behaviour (P+D)**: Position + direction labels → two-arc ring topology
- **CEBRA-Behaviour (Pos)**: Position only → ring with less direction separation
- **CEBRA-Behaviour (Dir)**: Direction only → two clusters
- **CEBRA-Time**: No labels, temporal contrastive only → independently discovers ring structure

A shuffled control produces a featureless sphere, confirming the structure is neural, not artifactual.

### 3. Position decoding
A k-nearest-neighbors decoder on CEBRA embeddings achieves:
- **R² > 0.9** and **MAE ~5 cm** (on a 160 cm track)
- Compared to ~50 cm MAE for shuffled controls
- Outperforms PCA-based decoding (~15 cm MAE)

### 4. Cross-subject consistency
Simulated 4 "subjects" by partitioning neurons into non-overlapping groups. After independent CEBRA training and Procrustes alignment:
- **CEBRA pairwise R²: 0.88–0.91** (highly consistent)
- **PCA pairwise R²: -0.21 to -0.51** (anti-correlated)

This is the core advantage of CEBRA — different neural populations encoding the same behavior produce alignable embeddings.

### 5. Topological analysis
Persistent cohomology (via `ripser`) verifies the ring topology of hippocampal embeddings:
- **CEBRA models**: β₀=1 (connected), β₁=1 (one loop) — confirmed ring
- **Shuffled control**: β₁ >> 1 — no coherent topology
- Circular coordinate extraction shows monotonic position mapping around the ring

---

## Project structure

```
├── index.html              # Entry HTML with dark theme
├── package.json            # Vite + React dependencies
├── vite.config.js          # Vite configuration
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Complete blog component
    └── imageData.js        # 9 figures as base64 data URIs (~1MB)
```

All figures are embedded directly in `imageData.js` as base64-encoded PNGs, so the site is fully self-contained with no external image dependencies.

---

## The figures

| # | Figure | What it shows |
|---|--------|---------------|
| 1 | Synthetic comparison | 5-panel: True latent, CEBRA, PCA, UMAP, t-SNE |
| 2 | Reconstruction scores | R² bar chart across methods |
| 3 | Hippocampus embeddings | 6-panel 3D scatter (P+D, Pos, Dir, Time, Shuffled, Direction-colored) |
| 4 | Decoding performance | R² and MAE horizontal bars |
| 5 | Decoded trajectory | Time series overlay — decoded vs ground truth |
| 6 | Consistency matrices | CEBRA vs PCA heatmaps + boxplot |
| 7 | Persistence diagrams | Birth-death plots with Betti numbers |
| 8 | Lifespan diagrams | Ranked H₀ and H₁ persistence bars |
| 9 | Circular coordinates | Angular coordinate vs physical position |

All figures use a custom dark matplotlib theme (`#0a0f14` background, `#64dcc8` teal accents) designed to match the blog's visual identity.

---

## How it was built

### The implementation (Google Colab + A100)

The entire CEBRA implementation was done in a single Jupyter notebook on Google Colab with an A100 GPU. Key tools:

- **[CEBRA](https://github.com/AdaptiveMotorControlLab/CEBRA)** (`pip install cebra`) — the core embedding library
- **PyTorch** — CEBRA's backend
- **scikit-learn** — kNN decoding, PCA, Procrustes alignment
- **ripser** — persistent cohomology computation
- **UMAP / t-SNE** — baseline comparisons
- **matplotlib + seaborn** — figure generation with custom dark theme

### The blog (React + Vite)

The blog itself is a single-page React application with:
- **Animated neuron particle background** — canvas-based with synaptic connections
- **Scroll-triggered fade-in animations** — via IntersectionObserver
- **Clickable image lightbox** — click any figure for full-screen view
- **Typography** — Instrument Serif (headings), Source Serif 4 (body), JetBrains Mono (code)
- **Dark theme** — `#060b10` background with bioluminescent teal (`#64dcc8`) accents
- **Debug callout cards** — coral-accented boxes documenting each bug encountered

### The debugging (Claude)

Claude was used as an AI co-pilot throughout the implementation. Notable debugging moments:

| Bug | Problem | Fix | Time |
|-----|---------|-----|------|
| PyTorch attribute | `total_mem` vs `total_memory` | One-character fix | ~2s |
| Data loader | CEBRA API changed across versions | 4-tier fallback cascade | ~30s |
| Ripser hang | H₂ computation O(n³) on 2000 pts | `max_dim=1`, `n_subsample=800` | ~10s |
| Colab disconnect | Stale outputs after kernel reset | Diagnosed visual persistence bug | ~5s |

Total debugging: ~15 minutes out of a ~2 hour session.

---

## Deploy your own

This project is designed for one-click Vercel deployment:

1. Fork this repo
2. Go to [vercel.com](https://vercel.com) → **Add New → Project**
3. Select the forked repo
4. Click **Deploy**

Vercel auto-detects Vite. No configuration needed.

### Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

---

## Reproducing the results

To reproduce the CEBRA analysis yourself:

1. Open Google Colab with a GPU runtime (A100 recommended, T4 works too)
2. Install dependencies:
   ```python
   !pip install cebra ripser persim umap-learn
   ```
3. The full notebook generates all 9 figures in ~20 minutes on A100 (~45 min on T4)

Key parameters for stable execution:
- CEBRA training: `batch_size=512`, `learning_rate=3e-4`, `max_iterations=10000`
- Persistent homology: `max_dim=1` (not 2), `n_subsample=800`
- Cross-subject: `n_subjects=4`, `n_runs=5`

---

## References

- Schneider, S., Lee, J.H. & Mathis, M.W. *Learnable latent embeddings for joint behavioural and neural analysis.* Nature 617, 360–368 (2023)
- Grosmark, A.D. & Buzsáki, G. *Diversity in neural firing dynamics supports both rigid and learned hippocampal sequences.* Science 351, 1440–1443 (2016)
- CEBRA documentation: [cebra.ai/docs](https://cebra.ai/docs/)
- CEBRA source: [github.com/AdaptiveMotorControlLab/CEBRA](https://github.com/AdaptiveMotorControlLab/CEBRA)

---

## License

Blog content © 2026 Nayanika Biswas. Code is MIT licensed.
