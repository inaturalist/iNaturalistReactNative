// @flow

import * as React from "react";
import { Platform, useWindowDimensions } from "react-native";
import HTML, { defaultSystemFonts } from "react-native-render-html";

type Props = {
  description: ?string
}

const UserDescription = ( { description }: Props ): React.Node => {
  const { width } = useWindowDimensions( );

  const baseStyle = {
    fontFamily: `Whitney-Light${Platform.OS === "ios"
      ? ""
      : "-Pro"}`,
    fontSize: 16,
    lineHeight: 22
  };
  const fonts = ["Whitney-Light", "Whitney-Light-Pro", ...defaultSystemFonts];

  const source = { html: description };

  return (
    <HTML
      contentWidth={width}
      source={source}
      systemFonts={fonts}
      baseStyle={baseStyle}
    />
  );
};

export default UserDescription;
