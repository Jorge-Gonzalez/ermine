import assert from "node:assert/strict";
import { test } from "node:test";

import { SKIN_SOCKETS, SOCKET_FAMILIES, type SkinSocket } from "../src/theme/sockets.generated.ts";
import {
  applyTheme,
  resolveTheme,
  validateBindings,
  type Palette,
  type SocketBindings,
  type StyleTarget,
} from "../src/theme/theme-plane.ts";

// A complete, contract-satisfying binding built from placeholder values (no real palette).
const completeBindings = (value = "x"): SocketBindings =>
  Object.fromEntries(SKIN_SOCKETS.map((socket) => [socket, value])) as SocketBindings;

const palette = (): Palette => ({
  humo: { light: completeBindings("light-humo"), dark: completeBindings("dark-humo") },
  mar: { light: completeBindings("light-mar"), dark: completeBindings("dark-mar") },
});

test("the socket contract is registry-derived and internally consistent", () => {
  // Every family socket is in the flat list, and the families partition it.
  const flat = Object.values(SOCKET_FAMILIES).flat();
  assert.deepEqual([...flat].sort(), [...SKIN_SOCKETS].sort());
});

test("a complete palette binding validates with zero errors", () => {
  assert.deepEqual(validateBindings(completeBindings()), []);
});

test("a missing socket is named specifically", () => {
  const bindings = completeBindings() as Record<string, string>;
  delete bindings.accent;
  assert.deepEqual(validateBindings(bindings), ["missing socket: accent"]);
});

test("an empty socket value fails", () => {
  const bindings = completeBindings();
  bindings.ink = "   ";
  assert.deepEqual(validateBindings(bindings), ["empty socket value: ink"]);
});

test("an unregistered socket fails — a project may not invent sockets", () => {
  const bindings = { ...completeBindings(), "brand-special": "#fff" };
  assert.deepEqual(validateBindings(bindings), ["unregistered socket: brand-special"]);
});

test("resolveTheme picks the requested theme and explicit mode", () => {
  assert.equal(resolveTheme(palette(), "mar", "dark").ink, "dark-mar");
  assert.equal(resolveTheme(palette(), "humo", "light").ink, "light-humo");
});

test("system mode resolves through prefersDark, not a third palette", () => {
  assert.equal(resolveTheme(palette(), "humo", "system", true).ink, "dark-humo");
  assert.equal(resolveTheme(palette(), "humo", "system", false).ink, "light-humo");
});

test("an unknown theme throws clearly", () => {
  assert.throws(() => resolveTheme(palette(), "acera", "light"), /unknown theme: acera/);
});

test("applyTheme writes every socket as a --custom-property, framework-free", () => {
  const written = new Map<string, string>();
  const target: StyleTarget = { style: { setProperty: (p, v) => void written.set(p, v) } };
  applyTheme(completeBindings("v"), target);
  assert.equal(written.size, SKIN_SOCKETS.length);
  for (const socket of SKIN_SOCKETS) assert.equal(written.get(`--${socket}`), "v");
});

test("SkinSocket type covers the color carriers and role hues", () => {
  const carriers: SkinSocket[] = ["ground", "ink", "rule"];
  const roles: SkinSocket[] = ["accent", "pass", "warn", "fail", "note"];
  for (const socket of [...carriers, ...roles]) assert.ok(SKIN_SOCKETS.includes(socket));
});
