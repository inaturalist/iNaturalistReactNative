// @flow
import classNames from "classnames";
import { ImageBackground, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import LinearGradient from "react-native-linear-gradient";

type URI = {
  uri: string,
};

type Props = {
  uri?: URI,
  disableGradient?: boolean,
  opaque?: boolean
};

const MyObservationsImageBackground = ( {
  uri,
  disableGradient = false,
  opaque = false
}: Props ): Node => {
  const noImg = !uri?.uri;

  const gradient = (
    <LinearGradient colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}>
      <View className="grow aspect-square" />
    </LinearGradient>
  );

  if ( noImg ) {
    return gradient;
  }

  return (
    <ImageBackground
      source={uri}
      className={classNames( "grow aspect-square", { "opacity-50": opaque } )}
      testID="ObsList.photo"
    >
      {!disableGradient && gradient}
    </ImageBackground>
  );
};

export default MyObservationsImageBackground;
