// @flow
import { getHeaderTitle } from "@react-navigation/elements";
import classNames from "classnames";
import { Heading1, Heading4 } from "components/SharedComponents";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import { SafeAreaView, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { dropShadow } from "styles/global";
import colors from "styles/tailwindColors";

type Props = {
  navigation: Object,
  route: Object,
  options: Object,
};

const ContextHeader = ( {
  navigation, route, options
}: Props ): Node => {
  const customTitleComponent = typeof options.headerTitle === "function";
  const subtitle = options.headerSubtitle;

  const getTitle = () => {
    if ( options.headerTitle && !customTitleComponent ) {
      return options.headerTitle;
    }

    if ( options.title ) {
      return options.title;
    }

    return getHeaderTitle( options, route.name );
  };

  const handleBackNavigation = ( ) => {
    if ( navigation.canGoBack( ) ) {
      navigation.goBack( );
    } else {
      navigation.navigate( "TabNavigator", {
        screen: "TabStackNavigator",
        params: {
          screen: "ObsList"
        }
      } );
    }
  };

  const renderBackButton = () => {
    const extraPadding = {
      marginStart: 15
    };

    return (
      <BackButton
        color={colors.darkGray}
        onPress={handleBackNavigation}
        inCustomHeader
        customStyles={extraPadding}
      />
    );
  };

  const backButton = renderBackButton();

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
          "pr-[24px]",
          "pt-[6px]"
        )}
      >
        <View
          className={classNames(
            "flex",
            "flex-row",
            "items-start",
            "relative",
            "w-full",
            "pb-[10px]",
            {
              "justify-center": !options?.alignStart,
              "justify-start": options?.alignStart
            }
          )}
        >
          <View className="pr-1 pt-1.5">
            {backButton}
          </View>
          {customTitleComponent
            ? (
              options.headerTitle()
            )
            : (
              <View className="w-3/4">
                <Heading1 maxFontSizeMultiplier={1.5} className="mb-3">{getTitle()}</Heading1>
                {subtitle && <Heading4>{subtitle}</Heading4>}
              </View>
            )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ContextHeader;
