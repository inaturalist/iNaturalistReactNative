// @flow
import classnames from "classnames";
import { ImageBackground, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import LinearGradient from "react-native-linear-gradient";

type URI = {
  uri: string
}

type Props = {
  uri?: URI,
  opaque?: boolean
};

const ObsPreviewImage = ( { uri, opaque = false }: Props ): Node => ( uri ? (
  <ImageBackground
    source={uri}
    className={classnames( "grow aspect-square", { "opacity-50": opaque } )}
    testID="ObsList.photo"
  >
    <LinearGradient
      className="bg-transparent absolute inset-0"
      colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}
    />
  </ImageBackground>
) : (
  <LinearGradient colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}>
    <View className="grow aspect-square" />
  </LinearGradient>
) );

export default ObsPreviewImage;
