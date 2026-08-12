import getBreakpoint from "sharedHelpers/breakpoint";

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

export const MIN_SMALL_GRID_COLUMNS = 3;

export const SMALL_GRID_GAP = 3;

// TODO: ObsImagePreview has a hardcoded max-h of 210px. Once we do add tablet support
// and xl/2xl are actually reachable, tileSize can exceed 210px and the image will get
// height-clamped, so we'll want to revisit this.

// This sets the column count per breakpoint for the small grid view.
// These are just guesses to start (although I don't think we get into xl and 2xl
// unless we're dealing with tablets), so we'll want to test on a variety of devices/
// simulators esp for android. we never want to show fewer than 3 columns in this view,
// so MIN_SMALL_GRID_COLUMNS is our fallback regardless of what we set here.
export const SMALL_GRID_COLUMNS_BY_BREAKPOINT: Record<Breakpoint, number> = {
  sm: 3,
  md: 3,
  lg: 3,
  xl: 4,
  "2xl": 5,
};

export interface SmallGridLayout {
  numColumns: number;
  slotWidth: number;
  // Visible tile size for non-last columns: slotWidth minus the gap, left-
  // aligned within its slotWidth-sized wrapper so the leftover space reads
  // as a gap before the next column.
  tileSize: number;
  // Visible tile size for the last column in each row: the full slotWidth,
  // since there's no following column to leave a gap before.
  lastTileSize: number;
}

export function getSmallGridLayout( screenWidth: number ): SmallGridLayout {
  const breakpoint = getBreakpoint( screenWidth ) as Breakpoint;
  const numColumns = Math.max(
    MIN_SMALL_GRID_COLUMNS,
    SMALL_GRID_COLUMNS_BY_BREAKPOINT[breakpoint],
  );
  const slotWidth = screenWidth / numColumns;
  const tileSize = slotWidth - SMALL_GRID_GAP;
  const lastTileSize = slotWidth;
  return {
    numColumns, slotWidth, tileSize, lastTileSize,
  };
}
