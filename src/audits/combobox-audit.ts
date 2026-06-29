// combobox-audit.ts — confirming audit: does the rebuilt state model hold for an
// editable autocomplete combobox? Tests the one suspected gap: active-descendant.

type StateCategory =
  | "capability"        // container: members CAN enter state (distributed down)
  | "instance"          // element asserts ITS OWN state (self-backed)
  | "conditioned-skin"  // how a state looks
  | "relational";       // NEW? container asserts THIS member's state (inverted backing)

interface StateRec {
  word: string;
  category: StateCategory;
  arity: "binary" | "enumerated" | "continuous";
  driver: "interaction" | "input" | "environmental";
  selfBacking?: string[];        // backing on the element itself (instance)
  containerBacking?: {           // backing on the CONTAINER about this member (relational)
    attr: string;                // e.g. "aria-activedescendant"
    pointsToThisId: true;
  };
}

// The combobox option that is arrow-key-highlighted:
//  - focus is on the INPUT (not the option)  -> not `focus`
//  - user hasn't chosen it                    -> not `selected`
//  - keyboard, not pointer                    -> not `hover`
//  - transient pre-selection, not location    -> not `current`
//  - the OPTION carries no state attr; the INPUT has aria-activedescendant -> THIS option id

// Can the existing 3-category model express it? Try to file it as `instance`:
const tryAsInstance: StateRec = {
  word: "active-descendant", category: "instance",
  arity: "binary", driver: "interaction",
  selfBacking: ["aria-activedescendant"],   // WRONG: this attr is never on the option
};

// Entailment check as currently defined: "instance entails self-backing present ON THIS ELEMENT"
function lintInstanceSelf(el: { backing: Set<string> }, rec: StateRec): string[] {
  if (rec.category !== "instance") return [];
  const set = rec.selfBacking ?? [];
  return set.some(b => el.backing.has(b))
    ? []
    : [`'${rec.word}' requires self-backing {${set.join(", ")}} on this element — none present`];
}

// The active option's OWN attributes (it has none of the relevant kind):
const activeOption = { id: "opt-3", backing: new Set<string>() /* no aria-* on the option */ };
console.log("--- filing active-descendant as `instance` (current model) ---");
const r1 = lintInstanceSelf(activeOption, tryAsInstance);
console.log(r1.length ? "FAIL: " + r1[0] : "ok");
console.log("  => the option can NEVER satisfy self-backing; the attr lives on the container.");
console.log("  => `instance` category cannot express this state. Gap confirmed.\n");

// Now the proposed `relational` category with INVERTED entailment:
const asRelational: StateRec = {
  word: "active-descendant", category: "relational",
  arity: "binary", driver: "interaction",
  containerBacking: { attr: "aria-activedescendant", pointsToThisId: true },
};

// Inverted entailment: check the CONTAINER points at THIS member's id.
function lintRelational(
  member: { id: string },
  container: { attrs: Record<string, string> },
  rec: StateRec
): string[] {
  if (rec.category !== "relational") return [];
  const cb = rec.containerBacking!;
  return container.attrs[cb.attr] === member.id
    ? []
    : [`'${rec.word}' requires container.${cb.attr} === "${member.id}" — points elsewhere or absent`];
}

console.log("--- filing active-descendant as `relational` (proposed 4th category) ---");
const inputEl = { attrs: { "aria-activedescendant": "opt-3" } };       // input points at opt-3
const wrongInput = { attrs: { "aria-activedescendant": "opt-1" } };    // points elsewhere
console.log("container points here:", lintRelational(activeOption, inputEl, asRelational).length ? "FAIL" : "ok");
console.log("container points elsewhere:",
  lintRelational(activeOption, wrongInput, asRelational)[0] ?? "ok (unexpected)");

// Symmetry check: is `relational` just `selectable` pointing the other way?
console.log("\n--- twin check: capability vs relational ---");
console.log("selectable  : container says members CAN be selected   (capability, distributed DOWN)");
console.log("active-desc : container says THIS member IS active now  (relational, asserted DOWN at one)");
console.log("=> twins: capability is down-distributed potential; relational is down-asserted instance.");
console.log("=> the rebuild added the capability twin (selectable) and missed the instance twin.");
