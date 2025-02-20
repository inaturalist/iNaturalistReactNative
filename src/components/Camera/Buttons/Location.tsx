// eslint-disable-next-line max-len
import TransparentCircleButton from "components/SharedComponents/Buttons/TransparentCircleButton.tsx";
import React from "react";
import { GestureResponderEvent, ViewStyle } from "react-native";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";
import { useTranslation } from "sharedHooks";

const isTablet = DeviceInfo.isTablet();

interface Props {
  rotatableAnimatedStyle: ViewStyle;
  toggleLocation: ( _event: GestureResponderEvent ) => void;
  useLocation?: boolean;
}

const Location = ( {
  rotatableAnimatedStyle,
  toggleLocation,
  useLocation
}: Props ) => {
  const { t } = useTranslation( );

  let testID = "";
  let accessibilityHint = "";
  let name = "";
  if ( useLocation ) {
    name = "map-marker-outline";
    testID = "location-button-label-location";
    accessibilityHint = t( "Disable-location" );
  } else {
    name = "map-marker-outline-off";
    testID = "location-button-label-location-off";
    accessibilityHint = t( "Enable-location" );
  }

  return (
    <Animated.View
      style={!isTablet && rotatableAnimatedStyle}
      className="m-0 border-0"
    >
      <TransparentCircleButton
        onPress={toggleLocation}
        testID={testID}
        accessibilityLabel={t( "Location" )}
        accessibilityHint={accessibilityHint}
        icon={name}
      />
    </Animated.View>
  );
};

export default Location;
