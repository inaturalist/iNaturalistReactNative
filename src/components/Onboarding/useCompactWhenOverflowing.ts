import { useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

// Ignore sub-pixel differences between the content and viewport heights
const OVERFLOW_TOLERANCE = 1;

// Measures a ScrollView and reports compact once its content is taller than
// its viewport, so a step can tighten its layout to fit on short screens.
// Compact latches on: the compact layout is shorter and would otherwise fit,
// flipping back to the full layout and overflowing again
const useCompactWhenOverflowing = ( enabled: boolean ) => {
  const [compact, setCompact] = useState( false );
  const heights = useRef<{ viewport: number | null; content: number | null }>( {
    viewport: null,
    content: null,
  } );

  const latchIfOverflowing = ( ) => {
    const { viewport, content } = heights.current;
    if ( viewport !== null && content !== null && content > viewport + OVERFLOW_TOLERANCE ) {
      setCompact( true );
    }
  };

  if ( !enabled ) {
    return { compact: false, onLayout: undefined, onContentSizeChange: undefined };
  }

  return {
    compact,
    onLayout: ( event: LayoutChangeEvent ) => {
      heights.current.viewport = event.nativeEvent.layout.height;
      latchIfOverflowing( );
    },
    onContentSizeChange: ( _width: number, height: number ) => {
      heights.current.content = height;
      latchIfOverflowing( );
    },
  };
};

export default useCompactWhenOverflowing;
