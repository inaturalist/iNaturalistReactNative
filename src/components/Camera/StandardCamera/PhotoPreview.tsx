import classnames from "classnames";
import { Subheading1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

import PhotoCarousel, {
  LARGE_PHOTO_DIM,
  LARGE_PHOTO_GUTTER,
  SMALL_PHOTO_DIM,
  SMALL_PHOTO_GUTTER,
} from "./PhotoCarousel";

interface Props {
  isLandscapeMode?: boolean;
  isLargeScreen?: boolean;
  isTablet?: boolean;
  onDelete: ( _uri: string ) => void;
  photoUris: string[];
  rotation?: { value: number };
  takingPhoto: boolean;
}

const STYLE = {
  justifyContent: "center",
  flex: 0,
  flexShrink: 1,
} as const;

const PhotoPreview = ( {
  isLandscapeMode,
  isLargeScreen,
  isTablet,
  onDelete,
  photoUris,
  rotation,
  takingPhoto,
}: Props ) => {
  const { t } = useTranslation( );
  const wrapperDim = isLargeScreen
    ? LARGE_PHOTO_DIM + LARGE_PHOTO_GUTTER * 2
    : SMALL_PHOTO_DIM + SMALL_PHOTO_GUTTER * 2;

  let noPhotosNotice = (
    <Subheading1
      className={classnames(
        "text-white",
        "text-center",
        "text-xl",
        "w-full",
      )}
    >
      {t( "Photos-you-take-will-appear-here" )}
    </Subheading1>
  );
  if ( isTablet && isLandscapeMode ) {
    noPhotosNotice = (
      <Subheading1
        className={classnames(
          "text-white",
          "text-center",
          "text-xl",
          "absolute",
          "w-[500px]",
          "-rotate-90",
          "left-[-190px]",
          "top-[50%]",
        )}
      >
        {t( "Photos-you-take-will-appear-here" )}
      </Subheading1>
    );
  }

  const dynamicStyle: {
    width?: number | string;
    height?: number;
  } = {};
  if ( isTablet && isLandscapeMode ) {
    dynamicStyle.width = wrapperDim;
  } else {
    dynamicStyle.height = wrapperDim;
    dynamicStyle.width = "100%";
  }

  return (
    <View
      style={[STYLE, dynamicStyle]}
    >
      {
        photoUris.length === 0 && !takingPhoto
          ? noPhotosNotice
          : (
            <PhotoCarousel
              photoUris={photoUris.slice().reverse()}
              rotation={rotation}
              takingPhoto={takingPhoto}
              isLargeScreen={isLargeScreen}
              isTablet={isTablet}
              isLandscapeMode={isLandscapeMode}
              onDelete={onDelete}
            />
          )
      }
    </View>
  );
};

export default PhotoPreview;
