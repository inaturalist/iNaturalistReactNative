import type { ArgumentArray } from "classnames";
import classNames from "classnames";
import { INatIcon, PhotoCount } from "components/SharedComponents";
import { LinearGradient, View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React, { useCallback } from "react";
import type { ViewStyle } from "react-native";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

import ObsImage from "./ObsImage";

const ICON_DROP_SHADOW = getShadow( {
  offsetHeight: 1,
} );

interface Props extends PropsWithChildren {
  className?: string;
  hasSound?: boolean;
  height?: string;
  hidePhotoCount?: boolean;
  iconicTaxonName?: string;
  isBackground?: boolean;
  isMultiplePhotosTop?: boolean;
  isSmall?: boolean;
  obsPhotosCount?: number;
  opaque?: boolean;
  selectable?: boolean;
  selected?: boolean;
  source?: {
    uri: string;
  };
  style?: ViewStyle;
  testID?: string;
  useShortGradient?: boolean;
  white?: boolean;
  width?: string;
}

const ObsImagePreview = ( {
  children,
  className,
  hasSound = false,
  height = "h-[62px]",
  hidePhotoCount,
  iconicTaxonName,
  isBackground = true,
  isMultiplePhotosTop = false,
  isSmall = false,
  obsPhotosCount = 0,
  opaque = false,
  selectable = false,
  selected = false,
  source,
  style,
  testID,
  useShortGradient,
  white = false,
  width = "w-[62px]",
}: Props ) => {
  const borderRadius = isSmall
    ? "rounded-lg"
    : "rounded-2xl";

  const imageClassNames: ArgumentArray = [
    "max-h-[210px]",
    "overflow-hidden",
    "relative",
    borderRadius,
    height,
    className,
    width,
  ];

  const renderPhotoCount = useCallback( ( ) => {
    if ( obsPhotosCount <= 1 || hidePhotoCount ) return null;

    if ( isSmall ) {
      return (
        <View
          className={classNames(
            "absolute",
            "right-1",
            isMultiplePhotosTop
              ? "top-1"
              : "bottom-1",
          )}
        >
          <INatIcon name="photos-outline" color={colors.white} size={16} />
        </View>
      );
    }

    return (
      <View
        className={classNames(
          "absolute",
          "right-0",
          "p-2",
          isMultiplePhotosTop
            ? "top-0"
            : "bottom-0",
        )}
      >
        { obsPhotosCount !== 0
          && <PhotoCount count={obsPhotosCount} /> }
      </View>
    );
  }, [
    hidePhotoCount,
    isMultiplePhotosTop,
    isSmall,
    obsPhotosCount,
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
              "w-[24px] h-[24px] border-2 border-white": !selected,
            },
          )}
          style={ICON_DROP_SHADOW}
        >
          {selected && (
            <INatIcon name="checkmark" color={colors.darkGray} size={12} />
          )}
        </View>
      );
    }
    return null;
  }, [selectable, selected] );

  const renderGradient = useCallback( ( ) => {
    if ( isSmall ) return null;
    if ( useShortGradient ) {
      return (
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.6) 100%)"]}
          className="absolute w-full h-full"
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0, y: 1 }}
        />
      );
    }
    return (
      <LinearGradient
        colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}
        className="absolute w-full h-full"
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.75 }}
      />
    );
  }, [isSmall, useShortGradient] );

  const renderSoundIcon = useCallback( ( ) => {
    if ( !hasSound ) return null;

    if ( isSmall ) {
      return (
        <View
          className="absolute left-1 bottom-1"
          style={ICON_DROP_SHADOW}
        >
          <INatIcon name="sound" color={colors.white} size={16} />
        </View>
      );
    }

    return (
      <View
        className={classNames( "absolute left-0 top-0 p-1", {
          "p-2": !isSmall,
        } )}
        style={ICON_DROP_SHADOW}
      >
        <INatIcon name="sound" color={colors.white} size={18} />
      </View>
    );
  }, [hasSound, isSmall] );

  let content;

  if ( isSmall && ( obsPhotosCount === 0 && !source?.uri ) ) {
    imageClassNames.push( "justify-center", "items-center", "border-2" );
    if ( white ) imageClassNames.push( "border-white" );
  }

  if ( isSmall && obsPhotosCount === 0 && hasSound ) {
    content = <INatIcon name="sound" color={colors.darkGray} size={24} />;
  } else {
    content = (
      <>
        <ObsImage
          uri={source}
          opaque={opaque}
          iconicTaxonName={iconicTaxonName}
          white={white}
          isBackground={isBackground}
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
      </>
    );
  }

  return (
    <View
      className={classNames( imageClassNames )}
      style={style}
      testID={testID}
    >
      {content}
    </View>
  );
};

export default ObsImagePreview;
