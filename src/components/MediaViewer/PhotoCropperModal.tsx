import Modal from "components/SharedComponents/Modal";
import { View } from "components/styledComponents";
import React, { useCallback, useState } from "react";
import { StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Photo from "realmModels/Photo";
import type { CropRectangle } from "sharedHelpers/getCropRectangle";

import useEditLocalPhoto from "./hooks/useEditLocalPhoto";
import PhotoCropper from "./PhotoCropper";

interface Props {
  // The local photo to crop. The modal shows while this is set
  localFilePath: string | null;
  onClose: ( ) => void;
  // Called with the photo's current URI and the path of its cropped copy
  onEditPhoto: ( uri: string, newLocalFilePath: string ) => void;
}

// Crops a photo on its own, for screens that don't show the full media viewer
const PhotoCropperModal = ( { localFilePath, onClose, onEditPhoto }: Props ) => {
  const insets = useSafeAreaInsets( );
  const applyPhotoEdit = useEditLocalPhoto( onEditPhoto );
  const [saving, setSaving] = useState( false );
  const uri = Photo.getLocalPhotoUri( localFilePath || undefined );

  const cropPhoto = useCallback( async ( cropRectangle: CropRectangle ) => {
    if ( !localFilePath ) return;
    setSaving( true );
    await applyPhotoEdit( localFilePath, { rotation: 0, cropRectangle } );
    setSaving( false );
    onClose( );
  }, [applyPhotoEdit, localFilePath, onClose] );

  return (
    <Modal
      showModal={!!uri}
      fullScreen
      closeModal={onClose}
      disableSwipeDirection
      modal={(
        <View
          className="flex-1 bg-black"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <StatusBar barStyle="light-content" />
          {uri && (
            <PhotoCropper
              uri={uri}
              saving={saving}
              onCancel={onClose}
              onCrop={cropPhoto}
            />
          )}
        </View>
      )}
    />
  );
};

export default PhotoCropperModal;
