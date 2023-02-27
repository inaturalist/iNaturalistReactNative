// @flow
import classNames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

import MyObservationsImageBackground from "./MyObservationsImageBackground";

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

const MyObservationsImagePreview = ( {
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
      <MyObservationsImageBackground
        uri={source}
        opaque={opaque}
        disableGradient={disableGradient}
      />
      {selectable && (
        <View
          className={
            classNames(
              "flex items-center justify-center",
              "border-2 border-white rounded-full",
              "absolute m-2.5 right-0",
              "w-[24px] h-[24px]",
              {
                "bg-white": selected
              }
            )
          }
        >
          {selected && (
            <INatIcon
              name="checkmark"
              color={theme.colors.primary}
              size={12}
            />
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

export default MyObservationsImagePreview;
