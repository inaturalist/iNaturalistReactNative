import { reduce } from "lodash";
import screens from "styles/tailwindScreens";

export const BREAKPOINTS = reduce( screens, ( memo, widthString, breakpoint ) => {
  if ( typeof widthString !== "string" ) {
    throw new Error( `Unexpected breakpoint value: ${widthString}` );
  }
  memo[breakpoint] = parseInt( widthString.replace( "px", "" ), 10 );
  return memo;
}, { } as Record<string, number> );

const getBreakpoint = ( screenWidth: number ) => {
  if ( screenWidth >= BREAKPOINTS["2xl"] ) {
    return "2xl";
  }
  if ( screenWidth >= BREAKPOINTS.xl ) {
    return "xl";
  }
  if ( screenWidth >= BREAKPOINTS.lg ) {
    return "lg";
  }
  if ( screenWidth >= BREAKPOINTS.md ) {
    return "md";
  }
  return "sm";
};

export default getBreakpoint;
