# Engine registry schema

This document describes the contract for any registry that can drive the vocabulary-independent engine.

## Top-level bundle

- `records`: array of axis records; each record declares one axis.
- `scopes`: optional environment-scope prefixes; used by the parser to split prefixed words.
- `scales`: optional named value sets referenced by token domains.

## AxisRecord

- `axis`: unique axis id.
- `sibling`: client taxonomy bucket such as `layout` or `state`.
- `role`: one of `container`, `member`, `self`, or `none`.
- `signature`: one of the algebra signatures the engine understands.
- `vocabulary`: `closed` or `open`.
- `regime`: `free` or `negotiated`.
- `valueSpace`: the conceptual vocabulary the axis reasons over.
- `tokens`: regexes that match authored words; the parser tries them in order.
- `default`: the default member for the axis when no explicit word is present.
- `controls`: concrete CSS properties the axis owns.
- `mustNeverTouch`: CSS properties the axis must not emit.
- `subDials`, `dialOf`, `aliases`, `aliasMatch`, `parametricMembers`: open-axis and alias semantics.
- `stateGroup`: state-group-specific members and their arity/backing rules.
- `compositionHazards`, `parentInertness`: cross-axis predicates declared as data.
- `scopePrefix`: marks a prefix-only scope declaration.

## Token

- `pattern`: regex used to match the authored word.
- `shape`: human-readable description of the token.
- `valueDomain`: optional semantic domain for the matched value.
- `fallback`: marks a token that recognizes the shape but rejects the value.

## StateMember

- `word`: grammar word for the member.
- `arity`: `binary`, `enumerated`, or `continuous`.
- `driver`: `interaction`, `input`, or `environmental`.
- `stateCategory`: `capability`, `instance`, `conditioned-skin`, or `relational`.
- `entails`: backing truths the member requires.
- `relationalBacking`: container-side backing for relational members.
- `enumValues`: allowed values for enumerated members.
- `misuse`: a specific misuse rule for binary members.

## Behavioral contracts

- Valid-value tokens should be listed before fallback tokens.
- A whole-axis alias is mutually exclusive with every other word on its axis.
- The parser resolves prefixed words by scope before applying axis matching.
