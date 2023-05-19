// @flow
import classnames from "classnames";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";

import PhotoCarousel, {
  LARGE_PHOTO_DIM,
  LARGE_PHOTO_GUTTER,
  SMALL_PHOTO_DIM,
  SMALL_PHOTO_GUTTER
} from "./PhotoCarousel";

type Props = {
  rotation?: {
    value: number
  },
  isLandscapeMode?: boolean,
  isLargeScreen?: boolean,
  isTablet?: boolean,
  savingPhoto: boolean
}

const PhotoPreview = ( {
  isLandscapeMode,
  isLargeScreen,
  isTablet,
  rotation,
  savingPhoto
}: Props ): Node => {
  const {
    cameraPreviewUris: photoUris,
    deletePhotoFromObservation,
    setMediaViewerUris,
    setSelectedPhotoIndex
  } = useContext( ObsEditContext );
  const wrapperDim = isLargeScreen
    ? LARGE_PHOTO_DIM + LARGE_PHOTO_GUTTER * 2
    : SMALL_PHOTO_DIM + SMALL_PHOTO_GUTTER * 2;

  const deletePhoto = photoUri => {
    deletePhotoFromObservation( photoUri );
  };

  let noPhotosNotice = (
    <Text
      className={classnames(
        "text-white",
        "text-center",
        "text-xl",
        "w-full"
      )}
    >
      {t( "Photos-you-take-will-appear-here" )}
    </Text>
  );
  if ( isTablet && !isLandscapeMode ) {
    noPhotosNotice = (
      <Text
        className={classnames(
          "text-white",
          "text-center",
          "text-xl",
          "absolute",
          "w-[500px]",
          "-rotate-90",
          "left-[-190px]",
          "top-[50%]"
        )}
      >
        {t( "Photos-you-take-will-appear-here" )}
      </Text>
    );
  }

  const wrapperStyle = { justifyContent: "center" };
  if ( isTablet && !isLandscapeMode ) {
    // $FlowIssue[prop-missing]
    wrapperStyle.width = wrapperDim;
  } else {
    // $FlowIssue[prop-missing]
    wrapperStyle.height = wrapperDim;
    // $FlowIssue[prop-missing]
    wrapperStyle.width = "100%";
  }

  return (
    <View
      // eslint-disable-next-line react-native/no-inline-styles
      style={wrapperStyle}
    >
      {
        photoUris.length === 0
          ? noPhotosNotice
          : (
            <PhotoCarousel
              deletePhoto={deletePhoto}
              photoUris={photoUris}
              rotation={rotation}
              setMediaViewerUris={setMediaViewerUris}
              savingPhoto={savingPhoto}
              isLargeScreen={isLargeScreen}
              isTablet={isTablet}
              isLandscapeMode={isLandscapeMode}
              setSelectedPhotoIndex={setSelectedPhotoIndex}
            />
          )
      }
    </View>
  );
};

export default PhotoPreview;
