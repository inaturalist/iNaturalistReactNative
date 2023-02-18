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
  hasSmallBorderRadius?: boolean
};

const ObsPreviewImage = ( {
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
  hasSmallBorderRadius = false
}: Props ): Node => {
  const theme = useTheme( );
  const hasMultiplePhotos = obsPhotosCount > 1;
  const filterIconName = obsPhotosCount > 9 ? "filter-9-plus" : `filter-${obsPhotosCount || 2}`;
  const borderRadius = hasSmallBorderRadius ? "rounded-[8px]" : "rounded-[15px]";

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
          className={
            classNames(
              "flex items-center justify-center",
              "border-4 border-white rounded-full",
              "absolute m-1 right-0",
              "w-[28px] h-[28px]"
            )
          }
        >
          {selected && (
            <View className="w-[25px] h-[25px]">
              <IconMaterial
                // $FlowIgnore
                name="check-circle"
                color={theme.colors.onPrimary}
                size={25}
              />
            </View>
          )}
        </View>
      )}
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
