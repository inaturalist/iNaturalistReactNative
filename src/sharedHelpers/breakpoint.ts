import reduce from "lodash/reduce";
import screens from "styles/tailwindScreens";

/**
 * Maps a numeric value to a segment label defined by breakpoint config
 *
 * @remarks See implementation for comment of example use
 */
// e.g.:
// const label = valueToBreakpoint(
//   150,
//   [
//     [0, "0"],
//     [1, "1-9"],
//     [10, "10-99"],
//     [100, "100+"],
//   ],
// );
// label === "100+"
export const valueToBreakpoint = (
  value: number,
  breakpointToLabelTuples: [breakpoint: number, label: string][],
) => {
  const breakpointCount = breakpointToLabelTuples.length;
  if ( breakpointToLabelTuples.length < 2 ) {
    throw Error( "must provide at least 2 breakpoints" );
  }

  // tuples are more ergonomic for the caller, but paired collections
  // are cleaner for the implementation
  const breakpoints = [];
  const labels = [];
  for ( const [breakpoint, label] of breakpointToLabelTuples ) {
    breakpoints.push( breakpoint );
    labels.push( label );
  }

  let lastLowestBreakpoint = null;
  for ( const breakpoint of breakpoints ) {
    if ( lastLowestBreakpoint !== null && breakpoint <= lastLowestBreakpoint ) {
      throw Error( "breakpoints must be unique and ascending" );
    }
    lastLowestBreakpoint = breakpoint;
  }

  if ( value < breakpoints[0] ) {
    throw Error( "value cannot be lower than lowest breakpoint" );
  }

  for ( const index of breakpoints.keys() ) {
    const atFinalBreakpoint = index === breakpointCount - 1;
    const valueIsBelowNextThresold = value < breakpoints[index + 1];
    if ( atFinalBreakpoint || valueIsBelowNextThresold ) {
      return labels[index];
    }
  }
  throw Error( "breakpoint unresolvable" );
};

export const BREAKPOINTS = reduce( screens, ( memo, widthString, breakpoint ) => {
  if ( typeof widthString !== "string" ) {
    throw new Error( `Unexpected breakpoint value: ${widthString}` );
  }
  memo[breakpoint] = parseInt( widthString.replace( "px", "" ), 10 );
  return memo;
}, { } as Record<string, number> );

const getBreakpoint = ( screenWidth: number ) => valueToBreakpoint( screenWidth, [
  // duplicate "sm" here to maintain "sm" as the minimum, but leave room for maybe "xs"
  // to be added as a new breakpoint which would have its own breakpoint and replace "sm" as the 0
  [0, "sm"],
  [BREAKPOINTS.sm, "sm"],
  [BREAKPOINTS.md, "md"],
  [BREAKPOINTS.lg, "lg"],
  [BREAKPOINTS.xl, "xl"],
  [BREAKPOINTS["2xl"], "2xl"],
] );

export default getBreakpoint;
