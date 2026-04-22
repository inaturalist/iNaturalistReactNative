import getBreakpoint, { valueToBreakpoint } from "sharedHelpers/breakpoint";

describe( "breakpoint helpers", () => {
  describe( "valueToBreakpoint", () => {
    test.each( [
      [0, "0"],
      [1, "1-9"],
      [9, "1-9"],
      [10, "10-49"],
      [49, "10-49"],
      [50, "50-99"],
      [99, "50-99"],
      [100, "100+"],
      [101, "100+"],
      [1000, "100+"],
      // one-off randomish case in addition to boundary cases above
      [62, "50-99"],
    ] )( "should return appropriate segment label for input", ( input, expected ) => {
      const result = valueToBreakpoint( input, [
        [0, "0"],
        [1, "1-9"],
        [10, "10-49"],
        [50, "50-99"],
        [100, "100+"],
      ] );

      expect( result ).toBe( expected );
    } );
  } );

  describe( "getBreakpoint", () => {
    test.each( [
      // main focus on sm => md because of sm's role
      // as a non-zero breakpoint _but also_ as the default breakpoint / floor breakpoint
      [0, "sm"],
      [239, "sm"],
      [240, "sm"],
      [241, "sm"],
      [319, "sm"],
      [320, "md"],
      [321, "md"],
      [321, "md"],
      [1365, "xl"],
      [1366, "2xl"],
      [1367, "2xl"],
    ] )(
      "should return appropriate media query label for screenWidth",
      ( screenWidth, expected ) => {
        const result = getBreakpoint( screenWidth );

        expect( result ).toBe( expected );
      },
    );
  } );
} );
