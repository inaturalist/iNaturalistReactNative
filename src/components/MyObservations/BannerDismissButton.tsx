import { INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import colors from "styles/tailwindColors";

interface Props {
  accessibilityLabel: string;
  onPress: ( ) => void;
  testID: string;
}

const BannerDismissButton = ( {
  accessibilityLabel,
  onPress,
  testID,
}: Props ) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    className="absolute top-0 right-0 h-[44px] w-[44px] items-center
    justify-center z-10 active:opacity-75"
    onPress={onPress}
    testID={testID}
  >
    <View
      className="h-[24px] w-[24px] items-center justify-center rounded-full bg-darkGray/50"
    >
      <INatIcon
        name="close"
        color={colors.white}
        size={11}
      />
    </View>
  </Pressable>
);

export default BannerDismissButton;
