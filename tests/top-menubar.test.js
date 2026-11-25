import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("top menubar replaces the toolbar and activity bar and is accessible", () => {
  assert.doesNotMatch(html, /class="(toolbar|activity)"/);
  assert.doesNotMatch(html, /workspace-menu-trigger/);
  const triggers = html.match(/<button class="menu-trigger"[^>]*>/g) ?? [];
  assert.equal(triggers.length, 4);
  for (const trigger of triggers) assert.match(trigger, /aria-expanded="false"/);
  const panels = html.match(/<div class="menu-panel"[\s\S]*?<\/div>/g) ?? [];
  for (const panel of panels) {
    for (const button of panel.match(/<button [^>]*>/g)) assert.match(button, /role="menuitem"/);
  }
});

test("every menubar command is a registered command", async () => {
  const { commandActionForId } = await import("../src/ui/command-registry.js");
  for (const [, id] of html.matchAll(/data-command="([^"]+)"/g)) {
    assert.notEqual(commandActionForId(id).type, "unknown", id);
  }
});
