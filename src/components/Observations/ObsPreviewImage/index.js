// @flow
import classNames from "classnames";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

import Background from "./Background";

type SOURCE = {
  uri: string,
};

type Props = {
  source: SOURCE,
  observation?: Object,
  opaque?: boolean,
  width?: string,
  height?: string,
  isMultiplePhotosTop?: boolean,
  children?: Node,
  disableGradient?: boolean,
};

const ObsPreviewImage = ( {
  source,
  observation,
  height = "h-[62px]",
  width = "w-[62px]",
  opaque = false,
  isMultiplePhotosTop = false,
  children,
  disableGradient = false
}: Props ): Node => {
  const theme = useTheme( );
  const obsPhotosCount = observation?.observationPhotos?.length ?? 0;
  const hasMultiplePhotos = obsPhotosCount > 1;
  const hasSound = !!observation?.observationSounds?.length;
  const filterIconName = obsPhotosCount > 9 ? "filter-9-plus" : `filter-${obsPhotosCount || 2}`;

  return (
    <View
      className={classNames(
        "relative rounded-lg mr-[10px] overflow-hidden",
        height,
        width
      )}
    >
      <Background
        uri={source}
        opaque={opaque}
        disableGradient={disableGradient}
      />
      {hasMultiplePhotos && (
        <View
          className={classNames( "absolute right-0", {
            "bottom-0 p-1": !isMultiplePhotosTop,
            "top-0 p-2": isMultiplePhotosTop
          } )}
        >
          <IconMaterial
            // $FlowIgnore
            name={filterIconName}
            color={theme.colors.onPrimary}
            size={22}
          />
        </View>
      )}
      {hasSound && (
        <IconMaterial
          name="volume-up"
          color={theme.colors.onPrimary}
          size={22}
        />
      )}
      {children}
    </View>
  );
};

export default ObsPreviewImage;
