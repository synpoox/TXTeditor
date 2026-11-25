const sorts = new WeakMap();
const orders = new WeakMap();
let nextOrderId = 1;

// A sort belongs to one column layout: inserting or deleting columns drops it rather than sorting the wrong column.
export function gridSort(doc) {
  const sort = sorts.get(doc);
  if (sort && sort.columnCount !== doc.columnCount) setGridSort(doc, null);
  return sorts.get(doc) ?? null;
}

export function setGridSort(doc, sort) {
  if (sort) sorts.set(doc, { ...sort, columnCount: doc.columnCount });
  else sorts.delete(doc);
  orders.delete(doc);
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

// Display position -> source row. Row 0 (headers) never moves. Numbers sort before text, empty cells always last.
export function sortedRowOrder(doc, sort) {
  const order = Array.from({ length: doc.rowCount }, (_, row) => row);
  if (!sort) return order;
  const sign = sort.dir === "desc" ? -1 : 1;
  const keys = order.slice(1).map((row) => {
    const text = doc.getCell(row, sort.column).trim();
    return { row, text, number: NUMBER.test(text) ? Number(text) : null };
  });
  keys.sort((a, b) => {
    if (!a.text || !b.text) return a.text === b.text ? a.row - b.row : a.text ? -1 : 1;
    const [x, y] = [a.number, b.number];
    const cmp = x !== null && y !== null ? x - y : x !== null ? -1 : y !== null ? 1 : collator.compare(a.text, b.text);
    return sign * cmp || a.row - b.row;
  });
  return [0, ...keys.map((key) => key.row)];
}

// Re-sorts only when the row count changes (or the sort is re-applied), so editing a cell never moves rows under the cursor.
export function cachedRowOrder(doc) {
  const sort = gridSort(doc);
  if (!sort) return null;
  const hit = orders.get(doc);
  if (hit?.count === doc.rowCount) return hit;
  const order = sortedRowOrder(doc, sort);
  const position = new Array(order.length);
  order.forEach((row, pos) => { position[row] = pos; });
  const entry = { id: nextOrderId++, count: doc.rowCount, order, position };
  orders.set(doc, entry);
  return entry;
}

// Source-row runs [top, bottom] covered by display positions a..b, so a selection can span a scattered set of rows.
export function rowRuns(order, a, b) {
  const rows = order.slice(a, b + 1).sort((x, y) => x - y);
  const runs = [];
  for (const row of rows) {
    const last = runs[runs.length - 1];
    if (last && row === last[1] + 1) last[1] = row;
    else runs.push([row, row]);
  }
  return runs;
}
