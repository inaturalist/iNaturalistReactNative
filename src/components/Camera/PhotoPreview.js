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

  const emptyDescription = ( ) => (
    <Text
      className={classnames(
        "text-white text-xl ml-3",
        {
          "-rotate-90": !isSmallScreen && isLandscapeMode
        }
      )}
    >
      {t( "Photos-you-take-will-appear-here" )}
    </Text>
  );

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
          "h-[151px] pb-[18px] pt-[50px]": !isSmallScreen && !isLandscapeMode,
          "w-[120px] pt-[50px]": !isSmallScreen && isLandscapeMode

        }
      )}
      >
        <PhotoCarousel
          deletePhoto={deletePhoto}
          photoUris={photoUris}
          emptyComponent={emptyDescription}
          containerStyle="camera"
          setSelectedPhotoIndex={handleSelection}
          savingPhoto={savingPhoto}
          isSmallScreen={isSmallScreen}
          isLandscapeMode={isLandscapeMode}
        />
      </View>
    </>
  );
};

export default PhotoPreview;
