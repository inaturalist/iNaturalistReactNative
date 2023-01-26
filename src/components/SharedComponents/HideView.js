// @flow
import { View } from "components/styledComponents";
import * as React from "react";
import { memo, useEffect, useState } from "react";

// Understand this component has use cases such as when you want to maintain a page view
// and prevent its re-initialization.
// However, for the most part, it is preferable to remove the component from the DOM

type Props = {
  noInitialRender?: bool,
  hidden?: bool,
  children: React.Node
}

// to free up memory
const HideView: React.AbstractComponent<Props> = memo(
  ( { noInitialRender = false, hidden = true, children } ): React.Node => {
    const [rendered, setRendered] = useState( false );

    useEffect( () => {
      if ( !hidden ) {
        setRendered( true );
      }
    }, [hidden] );

    if ( noInitialRender && !rendered && hidden ) {
      return null;
    }

    const props = hidden ? { className: "hidden " } : {};
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <View {...props}>{children}</View>;
  }
);

export default HideView;
