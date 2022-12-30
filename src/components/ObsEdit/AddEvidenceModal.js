// @flow

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { MAX_PHOTOS_ALLOWED } from "components/Camera/StandardCamera";
import EvidenceButton from "components/SharedComponents/Buttons/EvidenceButton";
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback, useEffect,
  useRef, useState
} from "react";
import { useTranslation } from "react-i18next";

type Props = {
  showAddEvidenceModal: boolean,
  photoUris: Array<string>,
  setShowAddEvidenceModal: Function
}

const AddEvidenceModal = ( {
  showAddEvidenceModal,
  setShowAddEvidenceModal,
  photoUris
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const bottomSheetModalRef = useRef( null );

  const [snapPoint, setSnapPoint] = useState( 150 );

  const disableAddingMoreEvidence = photoUris.length >= MAX_PHOTOS_ALLOWED;

  const handleSheetChanges = useCallback( ( index: number ) => {
    // reset visibility when backdrop is pressed to hide sheet
    if ( showAddEvidenceModal && index < 0 ) {
      setShowAddEvidenceModal( false );
    }
  }, [showAddEvidenceModal, setShowAddEvidenceModal] );

  useEffect( ( ) => {
    if ( showAddEvidenceModal ) {
      bottomSheetModalRef.current?.present( );
    } else {
      bottomSheetModalRef.current?.dismiss( );
    }
  }, [showAddEvidenceModal] );

  const renderBackdrop = props => (
    <BottomSheetBackdrop
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      pressBehavior="close"
      appearsOnIndex={0}
      disappearsOnIndex={-1}
    />
  );

  const onImportPhoto = async () => {
    navigation.navigate( "PhotoGallery", { skipGroupPhotos: true } );

    bottomSheetModalRef.current?.dismiss();
  };

  const onTakePhoto = async () => {
    navigation.navigate( "StandardCamera", { addEvidence: true } );

    bottomSheetModalRef.current?.dismiss();
  };

  const onRecordSound = () => {
    // TODO - need to implement
  };

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        enableOverDrag={false}
        enablePanDownToClose={false}
        snapPoints={[snapPoint]}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
      >
        <View
          className="items-center p-10"
          onLayout={( {
            nativeEvent: {
              layout: { height }
            }
          } ) => {
            setSnapPoint( height + 50 );
          }}
        >
          <Text className="text-2xl ml-4 mb-4">{t( "Add-evidence" )}</Text>
          {disableAddingMoreEvidence
          && (
          <Text className="m-3">
            {t( "You-can-only-upload-20-media" )}
          </Text>
          )}
          <View className="flex-row w-full justify-around">
            <EvidenceButton
              icon="perm-media"
              handlePress={onImportPhoto}
              disabled={disableAddingMoreEvidence}
            />
            <EvidenceButton
              icon="photo-camera"
              handlePress={onTakePhoto}
              disabled={disableAddingMoreEvidence}
            />
            <EvidenceButton
              icon="keyboard-voice"
              handlePress={onRecordSound}
              disabled={disableAddingMoreEvidence}
            />
          </View>
          <Text
            className="underline mt-5"
            onPress={( ) => setShowAddEvidenceModal( false )}
          >
            {t( "Cancel" )}
          </Text>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default AddEvidenceModal;
