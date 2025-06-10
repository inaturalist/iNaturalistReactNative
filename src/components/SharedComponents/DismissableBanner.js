// @flow
import {
  Body2,
  INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadow( {
  offsetHeight: 2,
  shadowOpacity: 1,
  shadowRadius: 2
} );

type Props = {
  currentUser: Object | null,
  icon: string,
  iconColor: Object,
  text: Object,
  onPress: Function,
  dismiss: Function
}

const DismissableBanner = ( {
  currentUser,
  iconColor,
  icon,
  text,
  onPress,
  dismiss
}: Props ): React.Node => {
  const [isVisible, setIsVisible] = useState( true );
  const { t } = useTranslation( );

  const closeBanner = () => {
    setIsVisible( false );
    dismiss( );
  };

  if ( !currentUser && isVisible ) {
    return (
      <View className="pt-[20px] px-[20px]" pointerEvents="box-none">
        <Pressable
          className="absolute top-0 right-0 justify-center items-center h-[44px] w-[44px] z-20"
          accessibilityRole="button"
          onPress={() => closeBanner()}
          accessibilityLabel={t( "Close" )}
        >
          <View className="justify-center items-center bg-lightGray h-[25px] w-[25px] rounded-xl">
            <INatIcon
              name="close"
              color={colors.darkGray}
              size={11}
            />
          </View>
        </Pressable>
        <View pointerEvents="box-none">
          <Pressable
            style={DROP_SHADOW}
            accessibilityRole="button"
            className="flex-row items-center p-[15px] space-x-[12px] bg-white rounded-xl z-10"
            onPress={onPress}
            disabled={false}
          >
            <INatIcon
              name={icon}
              size={44}
              color={iconColor}
            />
            <Body2 className="flex-shrink">
              {text}
            </Body2>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
};

export default DismissableBanner;
