// @flow
import { getHeaderTitle, HeaderBackButton } from "@react-navigation/elements";
import classNames from "classnames";
import { Heading1, Heading4 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

type Props = {
  navigation: Object,
  route: Object,
  options: Object,
  back: boolean,
  alignStart?: boolean,
};

const ContextHeader = ( {
  navigation, route, options, back
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

  return (
    <View className="bg-white pb-[10px]">
      <View
        className={classNames( "bg-white px-[24px] z-[100]", {
          "pt-[30px]": Platform.OS === "android",
          "pt-[60px]": Platform.OS === "ios"
        } )}
        style={getShadowStyle( {
          shadowColor: colors.black,
          backgroundColor: colors.white,
          offsetWidth: 0,
          offsetHeight: 2,
          shadowOpacity: 0.25,
          shadowRadius: 2,
          elevation: 5
        } )}
      >
        <View
          className={classNames(
            "flex flex-col items-start relative w-full px-[36px] pb-[10px] ",
            {
              "justify-center": !options?.alignStart,
              "justify-start": options?.alignStart
            }
          )}
        >
          {back && (
            <View
              className={classNames( "ml-[-8px] absolute top-0", {
                "mt-[-4px]": Platform.OS === "android",
                "mt-[-8px]": Platform.OS === "ios"
              } )}
            >
              <HeaderBackButton
                tintColor={colors.black}
                onPress={navigation.goBack}
              />
            </View>
          )}
          {customTitleComponent ? (
            options.headerTitle()
          ) : (
            <View>
              <Heading1>{getTitle()}</Heading1>
              {subtitle && <Heading4>{subtitle}</Heading4>}
            </View>
          )}

          <View className="absolute right-0 top-0">
            {options?.headerRight?.()}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ContextHeader;
