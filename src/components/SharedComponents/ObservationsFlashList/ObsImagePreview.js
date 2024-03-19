// @flow
import classNames from "classnames";
import { INatIcon, PhotoCount } from "components/SharedComponents";
import { LinearGradient, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { useTheme } from "react-native-paper";
import { dropShadow } from "styles/global";

import ObsImage from "./ObsImage";

type SOURCE = {
  uri: string,
};

type Props = {
  children?: Node,
  className?: string,
  hasSound?: boolean,
  height?: string,
  iconicTaxonName?: string,
  isMultiplePhotosTop?: boolean,
  isSmall?: boolean,
  obsPhotosCount?: number,
  opaque?: boolean,
  selectable?: boolean,
  selected?: boolean,
  source: SOURCE,
  style?: Object,
  testID?: string,
  white?: boolean,
  width?: string
};

const ObsImagePreview = ( {
  children,
  className,
  hasSound = false,
  height = "h-[62px]",
  iconicTaxonName = "unknown",
  isMultiplePhotosTop = false,
  isSmall = false,
  obsPhotosCount = 0,
  opaque = false,
  selectable = false,
  selected = false,
  source,
  style,
  testID,
  white = false,
  width = "w-[62px]"
}: Props ): Node => {
  const theme = useTheme();
  const borderRadius = isSmall
    ? "rounded-lg"
    : "rounded-2xl";

  const imageClassName = classNames(
    "max-h-[210px]",
    "overflow-hidden",
    "relative",
    borderRadius,
    height,
    className,
    width
  );

  const renderPhotoCount = useCallback( ( ) => {
    if ( obsPhotosCount !== 1 ) {
      return (
        <View
          className={classNames( "absolute right-0 p-1", {
            "bottom-0": !isMultiplePhotosTop,
            "top-0": isMultiplePhotosTop,
            "p-2": !isSmall
          } )}
        >
          { !hasSound && !( isSmall && obsPhotosCount === 0 )
            && <PhotoCount count={obsPhotosCount} /> }
        </View>
      );
    }
    return null;
  }, [
    hasSound,
    isMultiplePhotosTop,
    isSmall,
    obsPhotosCount
  ] );

  const renderSelectable = useCallback( ( ) => {
    if ( selectable ) {
      return (
        <View
          className={classNames(
            "flex items-center justify-center",
            "rounded-full",
            "absolute m-2.5 right-0",
            {
              "bg-white": selected,
              "w-[24px] h-[24px]": selected,
              "w-[24px] h-[24px] border-2 border-white": !selected
            }
          )}
          style={dropShadow}
        >
          {selected && (
            <INatIcon name="checkmark" color={theme.colors.primary} size={12} />
          )}
        </View>
      );
    }
    return null;
  }, [selectable, selected, theme] );

  const renderGradient = useCallback( ( ) => {
    if ( !isSmall ) {
      return (
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}
          className="absolute w-full h-full"
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.75 }}
        />
      );
    }
    return null;
  }, [isSmall] );

  const renderSoundIcon = useCallback( ( ) => {
    if ( hasSound ) {
      return (
        <View
          className={classNames( "absolute left-0 top-0 p-1", {
            "p-2": !isSmall
          } )}
          style={dropShadow}
        >
          <INatIcon name="sound" color={theme.colors.onSecondary} size={18} />
        </View>
      );
    }
    return null;
  }, [hasSound, isSmall, theme] );

  return (
    <View
      className={imageClassName}
      style={style}
      testID={testID}
    >
      <ObsImage
        uri={source}
        opaque={opaque}
        imageClassName={imageClassName}
        iconicTaxonName={iconicTaxonName}
        white={white}
        isBackground
        iconicTaxonIconSize={
          isSmall
            ? 22
            : 100
        }
      />
      {renderGradient( )}
      {renderSelectable( )}
      {renderPhotoCount( )}
      {renderSoundIcon( )}
      {children}
    </View>
  );
};

export default ObsImagePreview;
