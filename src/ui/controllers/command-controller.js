import {
  canRunCommandForDocument,
  canRunCommandWithoutDocument,
  commandActionForId,
  commandLabelsForEnvironment,
  createCommandRunners
} from "../command-registry.js";
import {
  clearRangeCommand,
  clearRangesCommand,
  deleteColumnsCommand,
  deleteRowsCommand,
  fillSelectedCellsCommand,
  hiddenColumnsCommand,
  hiddenRowsCommand,
  incrementFillSelectedCellsCommand
} from "../../core/operations.js";
import { tText } from "../../core/i18n.js";
import { cachedRowOrder } from "../grid-sort-policy.js";
import { makeCustomCommand } from "../../core/undo.js";
import { rowRangesFromRanges } from "../row-operation-policy.js";

function deleteRowRunsCommand(doc, runs) {
  if (runs.length === 1) return deleteRowsCommand(doc, runs[0][0], runs[0][1] - runs[0][0] + 1);
  const commands = runs.map(([start, end]) => deleteRowsCommand(doc, start, end - start + 1)).reverse();
  return makeCustomCommand("Delete Row", {
    redo(target) {
      for (const item of commands) item.redo(target);
    },
    undo(target) {
      for (let i = commands.length - 1; i >= 0; i--) commands[i].undo(target);
    },
    contentChanged: true,
    lspChange: { kind: "full" },
    highlightChanges: commands.map((item) => item.lspChange)
  });
}

export function createCommandController({
  isDevelopmentMode,
  state,
  activeDoc,
  hasOpenDocument,
  activeDocumentKind = () => activeDoc()?.kind ?? "table",
  execute,
  rowsFromSelection,
  rowsForRowOperation = rowsFromSelection,
  columnsFromSelection,
  columnsForColumnOperation = columnsFromSelection,
  showError,
  handlers
}) {
  const commandLabels = () => commandLabelsForEnvironment({ isDevelopmentMode });
  const commands = createCommandRunners(commandLabels(), runCommand);

  function runCommand(id) {
    if (id === "close-all" && !state.workspace && !state.docs.length) return;
    if (!hasOpenDocument() && !canRunCommandWithoutDocument(id)) return showError(tText("error.openDocument"));
    if (hasOpenDocument() && !canRunCommandForDocument(id, activeDocumentKind())) {
      return showError(tText("error.tableOnly"));
    }
    const doc = activeDoc();
    const rect = state.selection.rect;
    const action = commandActionForId(id);
    if (action.type === "handler") return runCommandHandler(action.name);
    if (action.type === "fixture") return handlers.loadFixture(action.size);
    if (action.type === "execute") return executeCommandAction(action.name, doc, rect);
    if (action.type === "math") return handlers.math(action.kind);
    if (action.type === "freeze") return handlers.toggleFreeze(action.kind);
    if (action.type === "zoom") return handlers.zoomBy(action.delta);
    if (action.type === "zoom-reset") return handlers.zoomReset();
    if (action.type === "resize") return handlers.resizeFit(action.useSelection);
  }

  function runCommandHandler(name) {
    const handler = handlers[name];
    return handler?.();
  }

  function executeCommandAction(name, doc, rect) {
    if (name === "clearSelection") return execute(clearRangesCommand(doc, state.selection.ranges));
    // A selection can span several separate row runs (ctrl-click, or a sorted view); one command keeps it one undo step and one layout.
    if (name === "deleteRow") return execute(deleteRowRunsCommand(doc, rowRangesFromRanges(state.selection.ranges, doc.rowCount)));
    if (name === "clearRow") return execute(clearRangesCommand(doc, rowRangesFromRanges(state.selection.ranges, doc.rowCount).map(([top, bottom]) => ({ top, bottom, left: 0, right: doc.columnCount - 1 })), "Clear Row"));
    if (name === "hideRow") return execute(hiddenRowsCommand(rowsForRowOperation(), true));
    if (name === "unhideRows") return execute(hiddenRowsCommand(doc.hiddenRows, false));
    if (name === "deleteColumn") return execute(deleteColumnsCommand(doc, rect.left, rect.right - rect.left + 1));
    if (name === "clearColumn") return execute(clearRangeCommand(doc, { top: 0, bottom: doc.rowCount - 1, left: rect.left, right: rect.right }, "Clear Column"));
    if (name === "hideColumn") return execute(hiddenColumnsCommand(columnsForColumnOperation(), true));
    if (name === "unhideColumns") return execute(hiddenColumnsCommand(doc.hiddenColumns, false));
    if (name === "fill") return execute(fillSelectedCellsCommand(doc, state.selection.ranges, state.selection.anchor, cachedRowOrder(doc)?.position));
    if (name === "incrementFill") return execute(incrementFillSelectedCellsCommand(doc, state.selection.ranges, state.selection.anchor, cachedRowOrder(doc)?.position));
  }

  return {
    commandLabels,
    commands,
    runCommand
  };
}
