// VS Code-style Explorer sizing: dragging narrower than the snap point closes it, and a narrow window auto-closes it.
export const EXPLORER_MIN_WIDTH = 180;
export const EXPLORER_MAX_WIDTH = 520;
export const EXPLORER_SNAP_CLOSE_BELOW = 120;
export const EXPLORER_AUTO_CLOSE_BELOW = 720;
export const EXPLORER_AUTO_OPEN_AT = 780; // hysteresis so the panel does not flicker around the threshold

export function explorerDragResult(rawWidth) {
  if (rawWidth < EXPLORER_SNAP_CLOSE_BELOW) return { collapse: true };
  return { collapse: false, width: Math.min(EXPLORER_MAX_WIDTH, Math.max(EXPLORER_MIN_WIDTH, Math.round(rawWidth))) };
}

// Returns "hide", "show" or null. Only re-opens a panel the auto-close hid, never one the user closed.
export function explorerAutoVisibility({ windowWidth, visible, autoCollapsed }) {
  if (visible && !autoCollapsed && windowWidth < EXPLORER_AUTO_CLOSE_BELOW) return "hide";
  if (!visible && autoCollapsed && windowWidth >= EXPLORER_AUTO_OPEN_AT) return "show";
  return null;
}
