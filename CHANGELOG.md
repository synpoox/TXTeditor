# Changelog

## Unreleased

### Added
- Display-only column sort (ascending / descending) from the context menu. The table is never modified: rows keep their original indexes and the header row stays in place. Numbers sort before text and empty cells always last. A sort indicator shows in the sorted column header, and Clear Sort restores the original view.
- Selection, keyboard navigation, copy, paste, fill and Delete/Clear Row follow the displayed order while a sort is active.

### Known limitations
- Find Next follows source order, not the displayed order.
- Insert Row and Clone Row place the new blank row last in the sorted view.
- The order re-sorts only when the row count changes or the sort is re-applied, so editing a cell never moves rows under the cursor.
