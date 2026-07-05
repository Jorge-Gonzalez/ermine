# Density-ordering survey protocol

Status: **pre-committed before instrument construction or data collection**.

This survey measures agreement on the ordering of the six density words. It does not
collect explanations, demographic information, identifiers, or design/CSS context.

## Task shown to participants

The six words are presented in **RANDOMIZED** order:

- tight
- snug
- comfortable
- relaxed
- loose
- separated

The instruction shown is exactly:

> Order these words from least space to most space.

No other context is shown, and CSS is not mentioned.

## Sample

Minimum 30 complete responses; convenience sampling acceptable; note it.

A complete response contains each of the six words exactly once. Incomplete responses,
duplicates, and responses containing another word are excluded before calculation and
reported with the final sample count.

## Data handling

Responses are anonymous orderings only. The static instrument has no backend and stores
or transmits nothing; each participant copies a compact result string and sends it back
through a channel chosen by the researcher. Recruiting and channel administration are
outside the instrument.

## Metric

Mean pairwise agreement with the canonical order = for each of the 15 unordered word
pairs, the share of participants whose response orders that pair as the canonical order
does; average the 15 shares.

The canonical order used only for scoring is:

`tight < snug < comfortable < relaxed < loose < separated`

Every complete six-word ordering contributes one observation to each of the 15 pairs.
The tally reports each pair's agreeing count, complete-response count, and share before
reporting their unweighted arithmetic mean.

## DECISION RULE (pre-committed)

Mean pairwise agreement > 0.90 → names remain canonical, evidence attached to the
constitution's density section. ≤ 0.90 → numeric steps become canonical and the six
names become whole-axis-style aliases (mechanism per constitution §4.1); the ruling text
is drafted for human sign-off, not self-executed (R1 — the DATA is gathered here; the
RULING is applied to the constitution by its author).

The threshold is strict: exactly `0.90` takes the numeric-steps branch. The instrument
and tally may implement this frozen protocol, but neither may change the task, canonical
order, metric, threshold, or resulting branch after responses exist. A correction would
require a new versioned protocol committed before collecting data under that version.
