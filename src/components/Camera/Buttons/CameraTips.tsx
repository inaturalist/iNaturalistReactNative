import { useNavigation } from "@react-navigation/native";
import classNames from "classnames";
import RotatableIconWrapper from "components/Camera/RotatableIconWrapper";
import { TransparentCircleButton } from "components/SharedComponents";
import type { NoBottomTabStackScreenProps } from "navigation/types";
import React from "react";
import type { AnimatedStyle } from "react-native-reanimated";
import { useFeatureFlag, useTranslation } from "sharedHooks";
import { FeatureFlag } from "stores/createFeatureFlagSlice";

interface Props {
  cameraTipsClassName?: string;
  rotatableAnimatedStyle?: AnimatedStyle;
}

const CameraTips = ( { cameraTipsClassName, rotatableAnimatedStyle }: Props ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation<NoBottomTabStackScreenProps<"Camera">["navigation"]>( );
  const onboardingV2Enabled = useFeatureFlag( FeatureFlag.OnboardingV2Enabled );

  if ( !onboardingV2Enabled ) return null;

  return (
    <RotatableIconWrapper
      rotatableAnimatedStyle={rotatableAnimatedStyle}
      containerClass={classNames( cameraTipsClassName )}
    >
      <TransparentCircleButton
        onPress={( ) => navigation.navigate( "CameraTips" )}
        accessibilityLabel={t( "Camera-tips" )}
        accessibilityHint={t( "Opens-tips-for-taking-good-photos" )}
        icon="help"
      />
    </RotatableIconWrapper>
  );
};

export default CameraTips;
