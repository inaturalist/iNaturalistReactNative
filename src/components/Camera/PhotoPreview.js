// @flow
import classnames from "classnames";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import PhotoCarousel from "components/SharedComponents/PhotoCarousel";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";

type Props = {
  photoUris: Array<string>,
  setPhotoUris: Function,
  savingPhoto: boolean,
  isLandscapeMode?: boolean,
  isSmallScreen?: boolean
}

const PhotoPreview = ( {
  photoUris,
  setPhotoUris,
  savingPhoto,
  isLandscapeMode,
  isSmallScreen
}: Props ): Node => {
  const { deletePhotoFromObservation } = useContext( ObsEditContext );
  const [initialPhotoSelected, setInitialPhotoSelected] = useState( null );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  const handleSelection = photoUri => {
    setInitialPhotoSelected( photoUri );
    showModal( );
  };

  const deletePhoto = photoUri => {
    deletePhotoFromObservation( photoUri, photoUris, setPhotoUris );
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
  if ( !isSmallScreen && !isLandscapeMode ) {
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
    <>
      <MediaViewerModal
        mediaViewerVisible={mediaViewerVisible}
        hideModal={hideModal}
        initialPhotoSelected={initialPhotoSelected}
        photoUris={photoUris}
        setPhotoUris={setPhotoUris}
      />
      <View className={classnames(
        "bg-black",
        {
          "h-[110px] pb-[18px] pt-[50px]": isSmallScreen,
          "h-[151px]": !isSmallScreen && isLandscapeMode,
          "w-[120px]": !isSmallScreen && !isLandscapeMode
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
                containerStyle="camera"
                setSelectedPhotoIndex={handleSelection}
                savingPhoto={savingPhoto}
                isLargeScreen={!isSmallScreen}
                isLandscapeMode={isLandscapeMode}
              />
            )
        }
      </View>
    </>
  );
};

export default PhotoPreview;
