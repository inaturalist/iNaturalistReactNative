import {
  tailwindFontRegular
} from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import React from "react";
import { Text, TextProps } from "react-native";

interface OwnProps {
  maxFontSizeMultiplier?: number;
}

type CustomTextProps = TextProps & OwnProps;

const Body2 = ( props:CustomTextProps ) => {
  const {
    maxFontSizeMultiplier = 2
  } = props;
  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      className={classnames(
        "text-md trailing-tight text-darkGray",
        tailwindFontRegular
      )}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};

export default Body2;
