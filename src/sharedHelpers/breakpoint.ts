import screens from "styles/tailwindScreens";

export const BREAKPOINTS
  = Object.fromEntries(
    Object.entries( screens || {} ).map( ( [breakpoint, widthString] ) => {
      if ( typeof widthString !== "string" ) {
        throw new Error( `Unexpected breakpoint value: ${widthString}` );
      }
      return [breakpoint, parseInt( widthString, 10 )];
    } )
  );

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
