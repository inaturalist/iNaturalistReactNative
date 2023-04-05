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
  screenBreakpoint: string
}

const PhotoPreview = ( {
  photoUris,
  setPhotoUris,
  savingPhoto,
  screenBreakpoint
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
    <Text className="text-inatGreen text-xl ml-3">
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
        "bg-black pb-[18px] pt-[50px]",
        {
          "h-[110px]": ["sm", "md"].includes( screenBreakpoint ),
          "h-[151px]": ["lg", "xl", "2xl"].includes( screenBreakpoint )
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
          screenBreakpoint={screenBreakpoint}
        />
      </View>
    </>
  );
};

export default PhotoPreview;
