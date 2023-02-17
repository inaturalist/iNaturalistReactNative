// @flow
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
  deviceOrientation: string
}

const PhotoPreview = ( {
  photoUris,
  setPhotoUris,
  savingPhoto,
  deviceOrientation
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
    <Text className="text-white text-xl mt-20 ml-3">
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
      <View className="bg-black h-32">
        <PhotoCarousel
          deletePhoto={deletePhoto}
          photoUris={photoUris}
          emptyComponent={emptyDescription}
          containerStyle="camera"
          setSelectedPhotoIndex={handleSelection}
          savingPhoto={savingPhoto}
          deviceOrientation={deviceOrientation}
        />
      </View>
    </>
  );
};

export default PhotoPreview;
