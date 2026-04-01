import { Body1, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  onAnimationEnd: () => void;
  useLocation: boolean;
  visible: boolean;
}

const LocationStatus = ({ useLocation, visible, onAnimationEnd }: Props) => {
  const { t } = useTranslation();
  const opacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
  }));

  useEffect(() => {
    if (visible) {
      opacity.set(
        withSequence(
          withTiming(1, { duration: 200 }),
          withDelay(
            2000,
            withTiming(0, { duration: 200 }, finished => {
              if (finished && onAnimationEnd) {
                scheduleOnRN(onAnimationEnd);
              }
            }),
          ),
        ),
      );
    }
  }, [visible, onAnimationEnd, opacity]);

  if (!visible) {
    return null;
  }

  const name = useLocation
    ? "map-marker-outline"
    : "map-marker-outline-off";
  const text = useLocation
    ? t("Using-location")
    : t("Ignoring-location");

  return (
    <Animated.View style={animatedStyle}>
      <View className="flex-row self-center items-center bg-darkGray/50 rounded-lg mt-4 p-2">
        <INatIcon name={name} size={19} color={colors.white} />
        <Body1 className="text-white ml-2">{text}</Body1>
      </View>
    </Animated.View>
  );
};

export default LocationStatus;
