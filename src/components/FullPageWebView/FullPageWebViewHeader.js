// @flow
import { getHeaderTitle } from "@react-navigation/elements";
import classNames from "classnames";
import { Heading4 } from "components/SharedComponents";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dropShadow } from "styles/global";
import colors from "styles/tailwindColors";

type Props = {
  navigation: Object,
  route: Object,
  options: Object
};

const HEADER_STYLE = {
  backgroundColor: "white"
};

const BACK_BUTTON_STYLE = {
  position: "relative",
  start: 11
};

const FullPageWebViewHeader = ( {
  navigation,
  route,
  options
}: Props ): Node => {
  const insets = useSafeAreaInsets();
  const customTitleComponent = typeof options.headerTitle === "function";

  const getTitle = () => {
    if ( options.headerTitle && !customTitleComponent ) {
      return options.headerTitle;
    }

    if ( options.title ) {
      return options.title;
    }

    return getHeaderTitle( options, route.name );
  };

  return (
    <View
      style={{
        ...HEADER_STYLE,
        ...options.headerStyle,
        ...( options.headerShadowVisible && dropShadow ),
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right
      }}
    >
      <View
        className={classNames(
          "w-full",
          "bg-white",
          "flex-row",
          "h-[78px]",
          "items-center",
          "justify-between"
        )}
      >
        <BackButton
          color={colors.black}
          onPress={navigation.goBack}
          inCustomHeader
          customStyles={BACK_BUTTON_STYLE}
        />
        <Heading4>{getTitle()}</Heading4>
        <View aria-hidden className="w-[44px] h-[44px]" />
      </View>
    </View>
  );
};

export default FullPageWebViewHeader;
