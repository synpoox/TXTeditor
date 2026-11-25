import test from "node:test";
import assert from "node:assert/strict";
import { TableDocument } from "../src/core/table-model.js";
import { cachedRowOrder, setGridSort, sortedRowOrder } from "../src/ui/grid-sort-policy.js";

const doc = () => new TableDocument("t.txt", [["id", "n"], ["a", "10"], ["b", "2"], ["c", ""], ["d", "33"]]);

test("sort is a display order: header fixed, numeric, empties last, data untouched", () => {
  const d = doc();
  assert.deepEqual(sortedRowOrder(d, { column: 1, dir: "asc" }), [0, 2, 1, 4, 3]);
  assert.deepEqual(sortedRowOrder(d, { column: 1, dir: "desc" }), [0, 4, 1, 2, 3]);
  assert.deepEqual(d.rows.map((r) => r[0]), ["id", "a", "b", "c", "d"]);
});

test("cached order tracks edits and clears with the sort", () => {
  const d = doc();
  assert.equal(cachedRowOrder(d), null);
  setGridSort(d, { column: 1, dir: "asc" });
  assert.deepEqual(cachedRowOrder(d).order, [0, 2, 1, 4, 3]);
  d.setCell(2, 1, "99");
  assert.deepEqual(cachedRowOrder(d).order, [0, 1, 4, 2, 3]);
  setGridSort(d, null);
  assert.equal(cachedRowOrder(d), null);
});
