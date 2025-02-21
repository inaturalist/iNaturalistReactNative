import { INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { PropsWithChildren } from "react";
import { StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props extends PropsWithChildren {
  closeModal: () => void;
}

const OnboardingModalBase = ( {
  closeModal,
  children
}: Props ) => {
  const { t } = useTranslation( );
  const { top } = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View className="flex-1 relative">
        <View className={`absolute mt-[${top}px] right-0`}>
          <INatIconButton
            icon="close"
            color={colors?.white}
            size={19}
            onPress={closeModal}
            accessibilityLabel={t( "Close" )}
            accessibilityHint={t( "Closes-explanation" )}
          />
        </View>

        <View className="flex-1 justify-center items-center">
          <View
            className="bg-white rounded-3xl p-[25px]"
          >
            {children}
          </View>
        </View>
      </View>
    </>
  );
};

export default OnboardingModalBase;
