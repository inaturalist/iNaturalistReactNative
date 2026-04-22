import { getCurrentRoute } from "navigation/navigationUtils";
import React from "react";
import type { GestureResponderEvent, PressableProps, View } from "react-native";
import { Pressable } from "react-native";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "PressableWithTracking" );

interface Props extends PressableProps {
  ref?: React.Ref<View>;
}

const PressableWithTracking = ( props: Props ) => {
  const { onPress, ref, ...otherProps } = props;

  const handlePressWithTracking = ( event: GestureResponderEvent ) => {
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
};

export default PressableWithTracking;
