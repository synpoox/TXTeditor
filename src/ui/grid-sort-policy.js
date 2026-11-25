import { tableFileState } from "../core/table-file-state.js";

const sorts = new WeakMap();
const orders = new WeakMap();

export function gridSort(doc) {
  return sorts.get(doc) ?? null;
}

export function setGridSort(doc, sort) {
  if (sort) sorts.set(doc, sort);
  else sorts.delete(doc);
  orders.delete(doc);
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

// Display position -> source row. Row 0 (headers) never moves. Empty cells always sort last.
export function sortedRowOrder(doc, sort) {
  const count = doc.rowCount;
  const order = Array.from({ length: count }, (_, row) => row);
  if (!sort) return order;
  const sign = sort.dir === "desc" ? -1 : 1;
  const value = (row) => doc.getCell(row, sort.column);
  const body = order.slice(1).sort((a, b) => {
    const [x, y] = [value(a), value(b)];
    if (x === "" || y === "") return x === y ? a - b : x === "" ? 1 : -1;
    return sign * collator.compare(x, y) || a - b;
  });
  return [0, ...body];
}

// Cached by content revision, so scrolling and redraws never re-sort.
export function cachedRowOrder(doc) {
  const sort = gridSort(doc);
  if (!sort) return null;
  const key = `${tableFileState(doc).revision}|${doc.rowCount}`;
  const hit = orders.get(doc);
  if (hit?.key === key) return hit;
  const order = sortedRowOrder(doc, sort);
  const position = new Array(order.length);
  order.forEach((row, pos) => { position[row] = pos; });
  const entry = { key, order, position };
  orders.set(doc, entry);
  return entry;
}
