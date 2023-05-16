// @flow
import classnames from "classnames";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";

import PhotoCarousel from "./PhotoCarousel";

type Props = {
  savingPhoto: boolean,
  isLandscapeMode?: boolean,
  isLargeScreen?: boolean
}

const PhotoPreview = ( {
  savingPhoto,
  isLandscapeMode,
  isLargeScreen
}: Props ): Node => {
  const {
    deletePhotoFromObservation, cameraPreviewUris: photoUris, setMediaViewerUris,
    setSelectedPhotoIndex
  } = useContext( ObsEditContext );

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
  if ( isLargeScreen && !isLandscapeMode ) {
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

  return (
    <View className={classnames(
      "bg-black",
      {
        "h-[110px] pb-[18px] pt-[50px]": !isLargeScreen,
        "h-[151px]": isLargeScreen && isLandscapeMode,
        "w-[120px]": isLargeScreen && !isLandscapeMode
      },
      "justify-center"
    )}
    >
      {
        photoUris.length === 0
          ? noPhotosNotice
          : (
            <PhotoCarousel
              deletePhoto={deletePhoto}
              photoUris={photoUris}
              setMediaViewerUris={setMediaViewerUris}
              containerStyle="camera"
              savingPhoto={savingPhoto}
              isLargeScreen={isLargeScreen}
              isLandscapeMode={isLandscapeMode}
              setSelectedPhotoIndex={setSelectedPhotoIndex}
            />
          )
      }
    </View>
  );
};

export default PhotoPreview;
