# Changelog

## Unreleased

### Added
- Display-only column sort (ascending / descending) from the context menu. The table is never modified: rows keep their original indexes and the header row stays in place. Numbers sort before text and empty cells always last. A sort indicator shows in the sorted column header, and Clear Sort restores the original view.
- Selection, keyboard navigation, copy, paste, fill and Delete/Clear Row follow the displayed order while a sort is active.

### Changed
- The button toolbar, the E/P activity bar and the sidebar ⋯ menu are replaced by a single top menubar with File, Edit, View and Tools menus. The old ⋯ workspace actions (profiles, recent workspaces, hidden files) are under File > Workspace….
- Menus support keyboard navigation (arrow keys, Escape) and close when you click elsewhere or switch windows.
- The Explorer problem-count badge now shows on the View menu and its Explorer item.
- Lint Rules and Vector-LSP Hover are disabled in the Tools menu when the active lint engine doesn't use them.
- The grid context-menu actions are also in the menubar: Cut/Copy/Paste/Select All under Edit, and new Row Operations, Column Operations and Data (sort, fill, math, resize, unhide, go to definition) menus. Table items are disabled when no table is open.
- Hovering a menu while another is open switches to it.
- The Explorer behaves like VS Code: dragging it narrower than a snap point closes it, a window narrower than about 720px auto-closes it (and restores it when widened again), and a thin strip on the left edge reopens it.

### Known limitations
- Find Next follows source order, not the displayed order.
- Insert Row and Clone Row place the new blank row last in the sorted view.
- The order re-sorts only when the row count changes or the sort is re-applied, so editing a cell never moves rows under the cursor.
