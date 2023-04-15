import screens from "styles/tailwindScreens";

const getBreakpoint = initialWidth => {
  if ( initialWidth >= screens["2xl"].replace( "px", "" ) ) {
    return "2xl";
  }
  if ( initialWidth >= screens.xl.replace( "px", "" ) ) {
    return "xl";
  }
  if ( initialWidth >= screens.lg.replace( "px", "" ) ) {
    return "lg";
  }
  if ( initialWidth >= screens.md.replace( "px", "" ) ) {
    return "md";
  }
  return "sm";
};

export default getBreakpoint;
