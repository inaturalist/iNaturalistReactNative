import {
  getSmallGridLayout,
  MIN_SMALL_GRID_COLUMNS,
  SMALL_GRID_COLUMNS_BY_BREAKPOINT,
  SMALL_GRID_GAP,
} from "sharedHelpers/smallGridLayout";

describe( "getSmallGridLayout", () => {
  test.each( [
    [0, "sm"],
    [239, "sm"],
    [240, "sm"],
    [319, "sm"],
    [320, "md"],
    [389, "md"],
    [390, "lg"],
    [743, "lg"],
    [744, "xl"],
    [1365, "xl"],
    [1366, "2xl"],
  ] )(
    "at screenWidth %i (breakpoint %s), numColumns matches the configured column count",
    ( screenWidth, breakpoint ) => {
      const { numColumns } = getSmallGridLayout( screenWidth );
      const key = breakpoint as keyof typeof SMALL_GRID_COLUMNS_BY_BREAKPOINT;
      expect( numColumns ).toBe( SMALL_GRID_COLUMNS_BY_BREAKPOINT[key] );
    },
  );

  it( "falls back to MIN_SMALL_GRID_COLUMNS when a breakpoint is configured below it", () => {
    const originalSmColumns = SMALL_GRID_COLUMNS_BY_BREAKPOINT.sm;
    SMALL_GRID_COLUMNS_BY_BREAKPOINT.sm = MIN_SMALL_GRID_COLUMNS - 1;

    const { numColumns } = getSmallGridLayout( 100 ); // resolves to the "sm" breakpoint

    SMALL_GRID_COLUMNS_BY_BREAKPOINT.sm = originalSmColumns;

    expect( numColumns ).toBe( MIN_SMALL_GRID_COLUMNS );
  } );

  test.each( [320, 375, 390, 393, 402, 428, 744, 800, 1366, 1512] )(
    "at screenWidth %i, numColumns * slotWidth is exactly screenWidth, matching "
      + "FlashList's own internal column-width math",
    screenWidth => {
      const { numColumns, slotWidth } = getSmallGridLayout( screenWidth );
      expect( slotWidth * numColumns ).toBe( screenWidth );
    },
  );

  test.each( [320, 375, 390, 393, 402, 428, 744, 800, 1366, 1512] )(
    "at screenWidth %i, tileSize is slotWidth minus the gap, lastTileSize is the full slotWidth",
    screenWidth => {
      const { slotWidth, tileSize, lastTileSize } = getSmallGridLayout( screenWidth );
      expect( tileSize ).toBe( slotWidth - SMALL_GRID_GAP );
      expect( lastTileSize ).toBe( slotWidth );
    },
  );
} );
