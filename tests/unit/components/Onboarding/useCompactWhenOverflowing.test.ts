import { act, renderHook } from "@testing-library/react-native";
import useCompactWhenOverflowing from "components/Onboarding/useCompactWhenOverflowing";
import type { LayoutChangeEvent } from "react-native";

const layoutEvent = ( height: number ) => (
  {
    nativeEvent: {
      layout: {
        x: 0, y: 0, width: 360, height,
      },
    },
  } as LayoutChangeEvent
);

const measure = (
  result: { current: ReturnType<typeof useCompactWhenOverflowing> },
  viewport: number,
  content: number,
) => {
  act( ( ) => {
    result.current.onLayout?.( layoutEvent( viewport ) );
    result.current.onContentSizeChange?.( 360, content );
  } );
};

describe( "useCompactWhenOverflowing", ( ) => {
  it( "stays out of compact mode when the content fits", ( ) => {
    const { result } = renderHook( ( ) => useCompactWhenOverflowing( true ) );
    measure( result, 600, 600 );
    expect( result.current.compact ).toBe( false );
  } );

  it( "switches to compact mode when the content overflows, and stays there", ( ) => {
    const { result } = renderHook( ( ) => useCompactWhenOverflowing( true ) );
    measure( result, 600, 700 );
    expect( result.current.compact ).toBe( true );

    // The compact layout is shorter and fits, but switching back would
    // overflow again
    measure( result, 600, 500 );
    expect( result.current.compact ).toBe( true );
  } );

  it( "never switches to compact mode when disabled", ( ) => {
    const { result } = renderHook( ( ) => useCompactWhenOverflowing( false ) );
    measure( result, 600, 700 );
    expect( result.current.compact ).toBe( false );
  } );
} );
