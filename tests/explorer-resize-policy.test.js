import assert from "node:assert/strict";
import test from "node:test";
import { explorerAutoVisibility, explorerDragResult } from "../src/ui/explorer-resize-policy.js";

test("dragging the Explorer below the snap point closes it, otherwise clamps the width", () => {
  assert.deepEqual(explorerDragResult(60), { collapse: true });
  assert.deepEqual(explorerDragResult(119), { collapse: true });
  assert.deepEqual(explorerDragResult(130), { collapse: false, width: 180 });
  assert.deepEqual(explorerDragResult(300.4), { collapse: false, width: 300 });
  assert.deepEqual(explorerDragResult(900), { collapse: false, width: 520 });
});

test("narrow windows auto-close the Explorer and only re-open what auto-close hid", () => {
  assert.equal(explorerAutoVisibility({ windowWidth: 600, visible: true, autoCollapsed: false }), "hide");
  assert.equal(explorerAutoVisibility({ windowWidth: 750, visible: false, autoCollapsed: true }), null);
  assert.equal(explorerAutoVisibility({ windowWidth: 800, visible: false, autoCollapsed: true }), "show");
  assert.equal(explorerAutoVisibility({ windowWidth: 800, visible: false, autoCollapsed: false }), null);
  assert.equal(explorerAutoVisibility({ windowWidth: 600, visible: false, autoCollapsed: false }), null);
  // user re-opened it while already narrow: a further resize must not hide it again
  assert.equal(explorerAutoVisibility({ windowWidth: 600, visible: true, autoCollapsed: false, previousWidth: 640 }), null);
  assert.equal(explorerAutoVisibility({ windowWidth: 700, visible: true, autoCollapsed: false, previousWidth: 800 }), "hide");
});
