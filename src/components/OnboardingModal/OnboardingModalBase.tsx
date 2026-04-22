import { INatIconButton, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React from "react";
import { StatusBar } from "react-native";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props extends PropsWithChildren {
  closeModal: () => void;
}

const OnboardingModalBase = ( {
  closeModal,
  children,
}: Props ) => {
  const { t } = useTranslation( );
  return (
    <ViewWrapper wrapperClassName="bg-white/0">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View className="flex-1 relative">
        <View className="flex-1 justify-center items-center">
          <View
            className="bg-white rounded-3xl p-7 m-7"
          >
            {children}
          </View>
        </View>
        <View className="absolute right-0 m-3">
          <INatIconButton
            icon="close"
            color={colors?.white}
            size={19}
            onPress={closeModal}
            accessibilityLabel={t( "Close" )}
            accessibilityHint={t( "Closes-explanation" )}
          />
        </View>

      </View>
    </ViewWrapper>
  );
};

export default OnboardingModalBase;
