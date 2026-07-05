// engine/types.ts — the registry schema: what ANY vocabulary must declare for the
// engine to parse and judge it. Moved from the Ermine registry in B1; the axis
// data itself stays client-side — this package never imports it. Two behavioral
// contracts the types cannot express (see engine/SCHEMA.md once B2 lands):
// valid-value tokens must be listed before fallback tokens, and a whole-axis
// alias is mutually exclusive with every other word on its axis.

// --- the algebra's own ontology (schema-level, not vocabulary) ---
export type Role = "container" | "member" | "self" | "none";
export type Signature =
  | "set-with-exclusivity"
  | "ordered-chain"
  | "container-operation"
  | "negotiated-field";
export type Vocabulary = "closed" | "open";
export type Regime = "free" | "negotiated";

// state-only refinements
export type StateCategory =
  | "capability"
  | "instance"
  | "conditioned-skin"
  | "relational";
export type Arity = "binary" | "enumerated" | "continuous";
export type Driver = "interaction" | "input" | "environmental";

// Named ordered value sets that axes may reference (step names are the stable
// grammar surface; the numbers behind them belong to themes).
export type Scales = Record<string, readonly string[]>;

// A `token` is what the parser actually matches against an authored word.
export interface Token {
  pattern: RegExp;
  // human label for the matched thing, e.g. "gap-<density>" or "grow-N"
  shape: string;
  // for open/parametric tokens: the value's domain, for messages + validation
  valueDomain?: string;
  // P3: this token recognizes the axis's WORD SHAPE (prefix/structure) but NOT a
  // sanctioned parameter value. Listed AFTER the valid-value token for an axis
  // (valid matches win first). A word resolving via a `fallback` token gets
  // `bad-parameter` (P3) — a more specific diagnosis than P2 `unknown-word`.
  fallback?: boolean;
}

// A state member inside a state-group axis.
export interface StateMember {
  word: string;
  arity: Arity;
  driver: Driver;
  stateCategory: StateCategory;
  // backing SET — any-one satisfies entailment. instance/relational only.
  entails?: string[];
  // for relational: the container attribute that must point at this member's id
  relationalBacking?: { containerAttr: string };
  // for enumerated arity: the closed value set
  enumValues?: string[];
  // P6 form (b): this binary word is a misuse when the element's REAL backing
  // carries one of these truths — a sibling word owns that state. The client
  // declares the truths and the full diagnosis text.
  misuse?: { whenBacking: readonly string[]; msg: string };
  note?: string;
}

// A whole-axis alias: a single word that names a COMPLETE value of the axis
// (it fixes every sub-dial at once), so it is mutually exclusive with every
// other word on the axis — other aliases and parametric dials included.
export interface Alias {
  word: string;
  expands: string; // canonical full expansion, e.g. "grow-1 shrink-1"
}

// P10 shape, declared as data: composing a word of THIS axis with a word of
// another axis is a hazard the author must acknowledge. The declaring client
// owns the words, the severity, and the diagnosis text.
export interface CompositionHazard {
  ownWords: readonly string[];
  otherAxis: string;
  otherWords: readonly string[];
  level: "warn" | "error";
  rule: string;
  msg: (ownWord: string, otherWord: string) => string;
}

// P11 shape, declared as data: words of THIS axis are silently inert when the
// PARENT carries any word of `parentAxis` (an outcome-level platform fact the
// declaring client established, e.g. CSS blockification of flex/grid items).
export interface ParentInertness {
  parentAxis: string;
  inertWords: readonly string[];
  level: "warn" | "error";
  rule: string;
  msg: (word: string) => string;
}

export interface AxisRecord {
  axis: string; // unique id; state groups use `state.<group>`
  sibling: string; // the client's plane taxonomy (layout/state/… for Ermine)
  role: Role;
  signature: Signature;
  vocabulary: Vocabulary;
  regime: Regime;

  // CONCEPTUAL member/value space (the scale or word set the grammar reasons in).
  valueSpace: readonly string[];
  // EMITTED tokens — what the parser matches against real authored class strings.
  tokens: Token[];

  default: string | null;
  controls: string[]; // concrete CSS properties (transcribed; see trust boundary)
  mustNeverTouch: string[];

  // OPEN axes with independent sub-dials (grow/shrink shape). Parametric tokens
  // write DIFFERENT dials and compose one-per-dial; two values for the SAME dial
  // conflict. `dialOf` maps a parsed token to its dial name.
  subDials?: string[];
  dialOf?: (member: string) => string | null;

  // OPEN axes may carry whole-axis aliases. `aliasMatch` tags pattern-shaped
  // whole-axis forms (e.g. a `padding-<step>` that sets both sides).
  aliases?: Alias[];
  aliasMatch?: (word: string) => boolean;

  // CLOSED axes whose member set includes PARAMETRIC members — a fixed word
  // carrying an open value. `open` applied at MEMBER scope inside a `closed`
  // axis; the linter treats them as ordinary members with validated values.
  parametricMembers?: string[];

  // state-group axes only:
  stateGroup?: {
    // "one" = at most one member per scope; "many" = independent predicates,
    // with optional pairwise conflicts and implies/refinement pairs.
    exclusivity: "one" | "many";
    conflicts?: [string, string][];
    implies?: [string, string][];
    members: StateMember[];
  };

  // declared cross-axis data the predicates consume (see the types above)
  compositionHazards?: CompositionHazard[];
  parentInertness?: ParentInertness;

  // environmental scope-prefix axis only
  scopePrefix?: boolean;

  notes?: string;
}

// An environment scope prefix — NOT an axis member. A prefix opens a condition
// scope; the word after the colon is an ordinary grammar word from some axis.
export interface ScopePrefix {
  id: string;
  pattern: RegExp; // matches the PREFIX part (before the colon)
  shape: string;
  role: Role;
  note?: string;
}

// --- the linter's I/O contract ---
export interface Parsed {
  raw: string;
  scope: string;            // "base" or an environment prefix id like "viewport-md"
  axis: string | null;      // resolved axis id, or null if unknown
  member: string | null;    // resolved member/word
  value?: string | number;  // open-axis parameter value
  isAlias?: boolean;        // a whole-axis alias (complete value, mutually exclusive)
  dial?: string | null;     // which sub-dial a parametric token sets
  stateMember?: StateMember;
  openFallback?: boolean;   // P3: matched a fallback token — shape ok, value not sanctioned
}

export interface Issue { level: "error" | "warn"; rule: string; msg: string; target?: string }

// Context the linter can't get from the class string alone. All optional — when
// a field is absent, the check that needs it is SKIPPED (not failed), so
// isolated linting never false-positives.
export interface LintContext {
  elementId?: string;
  containerAttrs?: Record<string, string>;
  // the PARENT element's class string (P11). Absent → parent unknown → skipped.
  parentClasses?: string;
}
