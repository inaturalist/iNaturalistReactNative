// @flow
import { getHeaderTitle } from "@react-navigation/elements";
import classNames from "classnames";
import { Heading4 } from "components/SharedComponents";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import { SafeAreaView, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { dropShadow } from "styles/global";
import colors from "styles/tailwindColors";

type Props = {
  navigation: Object,
  route: Object,
  options: Object
};

const BACK_BUTTON_STYLE = { position: "absolute", start: 21 };

const FullPageWebViewHeader = ( {
  navigation, route, options
}: Props ): Node => {
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
    <SafeAreaView
      className="bg-white"
      style={{
        ...options.headerStyle,
        ...( options.headerShadowVisible && dropShadow )
      }}
    >
      <View
        className={classNames(
          "w-full",
          "bg-white",
          "pt-[3px]",
          "pb-[20px]"
        )}
      >
        <View
          className={classNames(
            "flex",
            "flex-row",
            "relative",
            "w-full",
            "items-center",
            "justify-center"
          )}
        >
          <BackButton
            color={colors.black}
            onPress={navigation.goBack}
            inCustomHeader
            customStyles={BACK_BUTTON_STYLE}
          />
          <View>
            <Heading4>{getTitle()}</Heading4>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default FullPageWebViewHeader;
