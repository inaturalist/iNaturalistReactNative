import { getCurrentRoute } from "navigation/navigationUtils.ts";
import React from "react";
import { GestureResponderEvent, Pressable } from "react-native";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "PressableWithTracking" );

const PressableWithTracking = React.forwardRef( ( props, ref ) => {
  const { onPress, ...otherProps } = props;

  const handlePressWithTracking = ( event?: GestureResponderEvent ) => {
    if ( otherProps?.testID ) {
      const currentRoute = getCurrentRoute( );
      logger.info( `Button tap: ${otherProps?.testID}-${currentRoute?.name || "undefined"}` );
    }

    if ( onPress ) {
      onPress( event );
    }
  };

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Pressable {...otherProps} onPress={handlePressWithTracking} ref={ref} />;
} );

export default PressableWithTracking;
