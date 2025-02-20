import { Body1, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const LocationStatus = ( { useLocation, visible, onAnimationEnd } ) => {
  const { t } = useTranslation();
  const opacity = useRef( new Animated.Value( 0 ) ).current;

  useEffect( () => {
    if ( visible ) {
      Animated.sequence( [
        Animated.timing( opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        } ),
        Animated.delay( 2000 ),
        Animated.timing( opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        } )
      ] ).start( () => onAnimationEnd() );
    }
  }, [visible, opacity, onAnimationEnd] );

  if ( !visible ) {
    return null;
  }

  const name = useLocation
    ? "map-marker-outline"
    : "map-marker-outline-off";
  const text = useLocation
    ? t( "Using-location" )
    : t( "Ignoring-location" );

  return (
    <Animated.View style={{ opacity }}>
      <View className="flex-row self-center items-center bg-darkGray/50 rounded-lg mt-4 p-2">
        <INatIcon name={name} size={19} color={colors.white} />
        <Body1 className="text-white ml-2">{text}</Body1>
      </View>
    </Animated.View>
  );
};

export default LocationStatus;
