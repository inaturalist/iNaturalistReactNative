// @flow
import { getHeaderTitle, HeaderBackButton } from "@react-navigation/elements";
import { Heading1, Heading4 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

type Props = {
  navigation: Object,
  route: Object,
  options: Object,
  back: boolean,
};

const ContextHeader = ( {
  navigation, route, options, back
}: Props ): Node => {
  const title = options.title || getHeaderTitle( options, route.name );
  const subtitle = options.headerSubtitle;

  return (
    <View
      className="flex flex-row items-start bg-white pt-[60px] pb-[10px] px-[24px]"
      style={getShadowStyle( {
        shadowColor: colors.black,
        offsetWidth: 0,
        offsetHeight: 2,
        shadowOpacity: 0.25,
        shadowRadius: 2,
        elevation: 5
      } )}
    >
      {back && (
        <HeaderBackButton
          tintColor={colors.black}
          onPress={navigation.goBack}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ marginTop: -8, marginLeft: -8 }}
        />
      )}
      <View className="mr-auto">
        <Heading1>{title}</Heading1>
        {subtitle && <Heading4>{subtitle}</Heading4>}
      </View>

      {options?.headerRight?.()}
    </View>
  );
};

export default ContextHeader;
