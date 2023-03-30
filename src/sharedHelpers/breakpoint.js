import screens from "styles/tailwindScreens";

const getBreakpoint = initialWidth => {
  if ( initialWidth >= screens["2xl"] ) {
    return "2xl";
  }
  if ( initialWidth >= screens.xl ) {
    return "xl";
  }
  if ( initialWidth >= screens.lg ) {
    return "lg";
  }
  if ( initialWidth >= screens.md ) {
    return "md";
  }
  return "sm";
};

export default getBreakpoint;
