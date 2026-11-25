import test from "node:test";
import assert from "node:assert/strict";
import { TableDocument } from "../src/core/table-model.js";
import { cachedRowOrder, rowRuns, setGridSort, sortedRowOrder } from "../src/ui/grid-sort-policy.js";

const doc = () => new TableDocument("t.txt", [["id", "n"], ["a", "10"], ["b", "2"], ["c", ""], ["d", "33"]]);

test("sort is a display order: header fixed, numeric, empties last, data untouched", () => {
  const d = doc();
  assert.deepEqual(sortedRowOrder(d, { column: 1, dir: "asc" }), [0, 2, 1, 4, 3]);
  assert.deepEqual(sortedRowOrder(d, { column: 1, dir: "desc" }), [0, 4, 1, 2, 3]);
  assert.deepEqual(d.rows.map((r) => r[0]), ["id", "a", "b", "c", "d"]);
});

test("negatives and decimals compare as numbers, numbers before text", () => {
  const d = new TableDocument("t.txt", [["h"], ["-5"], ["1.10"], ["abc"], ["1.5"], ["-10"]]);
  assert.deepEqual(sortedRowOrder(d, { column: 0, dir: "asc" }), [0, 5, 1, 2, 4, 3]);
});

test("order is stable across edits, refreshes on row-count change or re-sort, and drops on column change", () => {
  const d = doc();
  assert.equal(cachedRowOrder(d), null);
  setGridSort(d, { column: 1, dir: "asc" });
  assert.deepEqual(cachedRowOrder(d).order, [0, 2, 1, 4, 3]);
  d.setCell(2, 1, "99");
  assert.deepEqual(cachedRowOrder(d).order, [0, 2, 1, 4, 3]);
  setGridSort(d, { column: 1, dir: "asc" });
  assert.deepEqual(cachedRowOrder(d).order, [0, 1, 4, 2, 3]);
  d.insertColumns?.(0, 1);
  assert.equal(cachedRowOrder(d), null);
});

test("rowRuns merges display positions into source-row ranges", () => {
  assert.deepEqual(rowRuns([0, 4, 2, 3, 1], 1, 3), [[2, 4]]);
  assert.deepEqual(rowRuns([0, 4, 1, 3, 2], 1, 2), [[1, 1], [4, 4]]);
});
