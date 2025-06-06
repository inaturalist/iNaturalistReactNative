import { getHeaderTitle, HeaderTitleProps } from "@react-navigation/elements";
import classNames from "classnames";
import { Heading4 } from "components/SharedComponents";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import { View } from "components/styledComponents";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dropShadow } from "styles/global";

type HeaderTitle = string | ( ( props: HeaderTitleProps ) => React.ReactNode ) | undefined;
type Props = {
  route: {
    name: string
  };
  options: {
    title?: string | undefined;
    headerTitle?: HeaderTitle;
    headerStyle?: object;
    headerShadowVisible?: boolean;
  };
};

const HEADER_STYLE = {
  backgroundColor: "white"
} as const;

const BACK_BUTTON_STYLE = {
  position: "relative",
  start: 11
} as const;

const FullPageWebViewHeader = ( {
  route,
  options
}: Props ) => {
  const insets = useSafeAreaInsets();

  const getTitle = (): string | React.ReactNode => {
    if ( options.headerTitle && typeof options.headerTitle !== "function" ) {
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
