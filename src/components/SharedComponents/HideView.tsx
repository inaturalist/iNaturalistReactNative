import { View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import * as React from "react";
import { useEffect, useState } from "react";

// This component's use case is prevent re-initialization of a component.
// Should be saved for components that are on/off screen a lot and expensive to start
// An example would be loading maps in a tab view
// However, for the most part, it is preferable to remove the component from the DOM

interface Props extends PropsWithChildren {
  noInitialRender?: boolean;
  show?: boolean;
}

// to free up memory
const HideView = ( {
  noInitialRender = false,
  show = false,
  children,
}: Props ) => {
  const [rendered, setRendered] = useState( false );

  useEffect( () => {
    if ( show ) {
      setRendered( true );
    }
  }, [show] );

  if ( noInitialRender && !rendered && !show ) {
    return null;
  }

  const props = show
    ? {}
    : { className: "hidden" };
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <View {...props}>{children}</View>;
};

export default HideView;
