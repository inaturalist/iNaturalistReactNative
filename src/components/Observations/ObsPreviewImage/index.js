// @flow
import classNames from "classnames";
import { INatIcon, PhotoCount } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { dropShadow } from "styles/global";

import Background from "./Background";

type SOURCE = {
  uri: string,
};

type Props = {
  source: SOURCE,
  children?: Node,
  obsPhotosCount?: number,
  selectable?: boolean,
  selected?: boolean,
  hasSound?: boolean,
  opaque?: boolean,
  width?: string,
  height?: string,
  isMultiplePhotosTop?: boolean,
  disableGradient?: boolean,
  hasSmallBorderRadius?: boolean,
};

const ObsPreviewImage = ({
  source,
  children,
  hasSound = false,
  obsPhotosCount = 0,
  selectable = false,
  selected = false,
  height = "h-[62px]",
  width = "w-[62px]",
  opaque = false,
  isMultiplePhotosTop = false,
  disableGradient = false,
  hasSmallBorderRadius = false,
}: Props): Node => {
  const theme = useTheme();
  const hasMultiplePhotos = obsPhotosCount > 1;
  const borderRadius = hasSmallBorderRadius ? "rounded-lg" : "rounded-2xl";

  return (
    <View
      className={classNames(
        "relative overflow-hidden",
        height,
        width,
        borderRadius
      )}
    >
      <Background
        uri={source}
        opaque={opaque}
        disableGradient={disableGradient}
      />
      {selectable && (
        <View
          className={classNames(
            "flex items-center justify-center",
            "rounded-full",
            "absolute m-2.5 right-0",

            {
              "bg-white": selected,
              "w-[24px] h-[24px]": selected,
              "w-[24px] h-[24px] border-2 border-white": !selected,
            }
          )}
          style={dropShadow}
        >
          {selected && (
            <INatIcon name="checkmark" color={theme.colors.primary} size={12} />
          )}
        </View>
      )}
      {hasMultiplePhotos && (
        <View
          className={classNames("absolute right-0 p-1", {
            "bottom-0": !isMultiplePhotosTop,
            "top-0": isMultiplePhotosTop,
            "p-2": !hasSmallBorderRadius,
          })}
        >
          <PhotoCount count={obsPhotosCount} />
        </View>
      )}
      {hasSound && (
        <View
          className={classNames("absolute left-0 top-0 p-1", {
            "p-2": !hasSmallBorderRadius,
          })}
          style={dropShadow}
        >
          <INatIcon name="sound" color={theme.colors.onSecondary} size={18} />
        </View>
      )}
      {children}
    </View>
  );
};

export default ObsPreviewImage;
