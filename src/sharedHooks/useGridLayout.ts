import { useMemo } from "react";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import { useDeviceOrientation } from "sharedHooks";

const GUTTER = 15;
const HALF_GUTTER = GUTTER / 2;
const TAB_BAR_HEIGHT = 80;

const flashListStyle = {
  paddingTop: HALF_GUTTER,
  paddingLeft: HALF_GUTTER,
  paddingRight: HALF_GUTTER,
  paddingBottom: TAB_BAR_HEIGHT + HALF_GUTTER
};

const useGridLayout = ( layout?: "list" ) => {
  const {
    isLandscapeMode, isTablet, screenWidth, screenHeight
  } = useDeviceOrientation();

  const calculateNumColumns = () => {
    if ( layout === "list" || screenWidth <= BREAKPOINTS.sm ) {
      return 1;
    }
    if ( !isTablet ) return 2;
    if ( isLandscapeMode ) return 6;
    if ( screenWidth <= BREAKPOINTS.xl ) return 2;
    return 4;
  };
  const numColumns = calculateNumColumns();

  const calculateGridItemWidth = () => {
    const combinedGutter = ( numColumns + 1 ) * GUTTER;
    const gridWidth = isTablet
      ? screenWidth
      : Math.min( screenWidth, screenHeight );
    return Math.floor( ( gridWidth - combinedGutter ) / numColumns );
  };
  const gridItemWidth = calculateGridItemWidth();

  const gridItemStyle = useMemo( ( ) => ( {
    height: gridItemWidth,
    width: gridItemWidth,
    margin: HALF_GUTTER
  } ), [gridItemWidth] );

  return {
    flashListStyle,
    gridItemStyle,
    numColumns
  };
};

export default useGridLayout;
