import { useNavigation } from "@react-navigation/native";
import { INatIconButton } from "components/SharedComponents";
import { TopAndBottomInsetViewWrapper } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import type { NoBottomTabStackScreenProps } from "navigation/types";
import React from "react";
import { useTranslation } from "sharedHooks";
import { dropShadow } from "styles/global";
import colors from "styles/tailwindColors";

const CameraTipsScreen = ( ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation<NoBottomTabStackScreenProps<"CameraTips">["navigation"]>( );

  return (
    <TopAndBottomInsetViewWrapper testID="CameraTips">
      <View className="flex-1">
        <View className="absolute top-0 right-0 m-3">
          <INatIconButton
            testID="CameraTips.close"
            icon="close"
            mode="contained"
            backgroundColor={colors.white}
            color={colors.darkGray}
            size={19}
            style={dropShadow}
            // The camera stays mounted under this screen, so going back
            // returns to it instead of reopening it
            onPress={( ) => navigation.goBack( )}
            accessibilityLabel={t( "Close" )}
            accessibilityHint={t( "Closes-camera-tips" )}
          />
        </View>
      </View>
    </TopAndBottomInsetViewWrapper>
  );
};

export default CameraTipsScreen;
