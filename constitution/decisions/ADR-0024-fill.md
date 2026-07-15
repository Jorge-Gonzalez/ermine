---
register: history
---

# ADR-0024 — `fill`: the first proportional-size word

source: `reports/GAP-U-fill-sizing.md`; `docs/proportional-plane.md`

Roughly nine Monky selectors set `width: 100%`, `height: 100%`, or `min-height: 100vh` to make an
element span its container — a spatial primitive with no Ermine word. `fill` is admitted as the
container-relative case: `fill` (both axes), `fill-inline` (inline axis), `fill-block` (block axis),
with the overflow/padding dial shape (whole-axis form conflicts with a per-axis dial; the two dials
compose).

`fill` is the first member of the **proportional layout plane** (`docs/proportional-plane.md`) and
the clean case of the relational/parametric distinction developed there: it is a *relational*
metric — the value is the proportion 100% — so it reads no theme socket, and it survives any
re-resolution (the invariance test). This is why it was chosen as the first member: it is the
smallest, most unambiguous piece, and its container relatum holds regardless of how the plane's
reference-frame question is later settled.

It is separated from flex growth deliberately: `grow-1`/`expandable` (m2) fills a flex container's
*main* axis by distributing free space, whereas `fill` sets an explicit self-size on either logical
axis and works outside flex. Emitted as `inline-size`/`block-size` (logical, matching the dial
names), which computes identically to `width`/`height: 100%` in horizontal writing mode.

Ownership is clean: `inline-size`/`block-size` are owned by no other axis (`constraints` owns
min/max, `m3` owns flex-basis), so no P7 sanction is needed.

Reserved pending their own evidence: viewport-relative fill (`100vh`), and fractional sizes
(`half`, `third`, …) — which in the plane's grid form ride `columns-N` as intent-proportions.

Introduces ruling: R-SIZE-01 (new area `SIZE`).
