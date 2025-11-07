import { getCurrentRoute } from "navigation/navigationUtils";
import React from "react";
import type { PressableProps } from "react-native";
import { GestureResponderEvent, Pressable } from "react-native";
import { log } from "sharedHelpers/logger";

const { getAnalytics, logEvent } = { getAnalytics: () => {}, logEvent: () => {} };
const logger = log.extend( "PressableWithTracking" );

const PressableWithTracking = React.forwardRef<typeof Pressable, PressableProps>(
  ( props, ref ) => {
    const { onPress, ...otherProps } = props;

    const handlePressWithTracking = ( event: GestureResponderEvent ) => {
      if ( otherProps?.testID ) {
        const currentRoute = getCurrentRoute( );
        logger.info( `Button tap: ${otherProps?.testID}-${currentRoute?.name || "undefined"}` );
        // Basic button tap tracking with Firebase Analytics
        const analytics = getAnalytics();
        logEvent( analytics, "button_tap", {
          testID: otherProps?.testID,
          screen: currentRoute?.name
        } );
      }

      if ( onPress ) {
        onPress( event );
      }
    };

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Pressable {...otherProps} onPress={handlePressWithTracking} ref={ref} />;
  }
);

export default PressableWithTracking;
