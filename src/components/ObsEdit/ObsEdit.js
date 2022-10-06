// @flow

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from "@gorhom/bottom-sheet";
import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import { useTranslation } from "react-i18next";
import { Menu } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

import Photo from "../../models/Photo";
import { ObsEditContext } from "../../providers/contexts";
import useLoggedIn from "../../sharedHooks/useLoggedIn";
import colors from "../../styles/colors";
import { textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import { MAX_PHOTOS_ALLOWED } from "../Camera/StandardCamera";
import MediaViewer from "../MediaViewer/MediaViewer";
import MediaViewerModal from "../MediaViewer/MediaViewerModal";
import Button from "../SharedComponents/Buttons/Button";
import EvidenceButton from "../SharedComponents/Buttons/EvidenceButton";
import KebabMenu from "../SharedComponents/KebabMenu";
import ScrollNoFooter from "../SharedComponents/ScrollNoFooter";
import { Pressable, Text, View } from "../styledComponents";
import DeleteObservationDialog from "./DeleteObservationDialog";
import EvidenceSection from "./EvidenceSection";
import IdentificationSection from "./IdentificationSection";
import OtherDataSection from "./OtherDataSection";

const ObsEdit = ( ): Node => {
  const {
    currentObsIndex,
    setCurrentObsIndex,
    observations,
    saveObservation,
    saveAndUploadObservation,
    setObservations
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { t } = useTranslation( );
  const bottomSheetModalRef = useRef( null );

  const lastScreen = params?.lastScreen;

  const isLoggedIn = useLoggedIn( );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [initialPhotoSelected, setInitialPhotoSelected] = useState( null );
  const [photoUris, setPhotoUris] = useState( [] );
  const [snapPoint, setSnapPoint] = useState( 150 );
  const [deleteDialogVisible, setDeleteDialogVisible] = useState( false );

  const disableAddingMoreEvidence = photoUris.length >= MAX_PHOTOS_ALLOWED;

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  const showNextObservation = ( ) => setCurrentObsIndex( currentObsIndex + 1 );
  const showPrevObservation = ( ) => setCurrentObsIndex( currentObsIndex - 1 );

  const showDialog = ( ) => setDeleteDialogVisible( true );
  const hideDialog = ( ) => setDeleteDialogVisible( false );

  const handleBackButtonPress = ( ) => {
    if ( lastScreen === "StandardCamera" ) {
      navigation.navigate( "StandardCamera", { photos: photoUris } );
    } else {
      // show modal to dissuade user from going back
      navigation.goBack( );
    }
  };

  const renderKebabMenu = ( ) => (
    <>
      <DeleteObservationDialog
        deleteDialogVisible={deleteDialogVisible}
        hideDialog={hideDialog}
      />
      <KebabMenu>
        <Menu.Item
          onPress={showDialog}
          title={t( "Delete" )}
        />
      </KebabMenu>
    </>
  );

  const renderHeader = ( ) => (
    <View className="flex-row justify-between">
      <HeaderBackButton onPress={handleBackButtonPress} tintColor={colors.black} />
      {observations.length === 1
        ? <Text className="text-2xl">{t( "New-Observation" )}</Text>
        : (
          <View className="flex-row items-center">
            <Pressable onPress={showPrevObservation} className="w-16">
              {currentObsIndex !== 0 && <Icon name="keyboard-arrow-left" size={30} />}
            </Pressable>
            <Text className="text-2xl">{`${currentObsIndex + 1} of ${observations.length}`}</Text>
            <Pressable onPress={showNextObservation} className="w-16">
              {( currentObsIndex !== observations.length - 1 )
                && <Icon name="keyboard-arrow-right" size={30} />}
            </Pressable>
          </View>
        )}
      {renderKebabMenu( )}
    </View>
  );

  const currentObs = observations[currentObsIndex];

  const setPhotos = uris => {
    const updatedObservations = observations;
    const updatedObsPhotos = currentObs.observationPhotos.filter( obsPhoto => {
      const { photo } = obsPhoto;
      if ( uris.includes( photo.url || photo.localFilePath ) ) {
        return obsPhoto;
      }
      return false;
    } );
    currentObs.observationPhotos = updatedObsPhotos;
    setObservations( [...updatedObservations] );
  };

  const handleSelection = photo => {
    setInitialPhotoSelected( photo );
    showModal( );
  };

  useEffect( ( ) => {
    if ( !currentObs || !currentObs.observationPhotos ) { return; }
    const uris = currentObs.observationPhotos.map(
      obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
    );
    setPhotoUris( uris );
  }, [currentObs] );

  const addEvidence = () => {
    bottomSheetModalRef.current?.present();
  };

  if ( !currentObs ) { return null; }

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
    navigation.navigate( "PhotoGallery", { photos: photoUris, editObs: true } );

    bottomSheetModalRef.current?.dismiss();
  };

  const onTakePhoto = async () => {
    navigation.navigate( "StandardCamera", { photos: photoUris } );

    bottomSheetModalRef.current?.dismiss();
  };

  const onRecordSound = () => {
    // TODO - need to implement
    console.log( "Record sound" );
  };

  return (
    <BottomSheetModalProvider>
      <MediaViewerModal
        mediaViewerVisible={mediaViewerVisible}
        hideModal={hideModal}
      >
        <MediaViewer
          initialPhotoSelected={initialPhotoSelected}
          photoUris={photoUris}
          setPhotoUris={setPhotos}
          hideModal={hideModal}
        />
      </MediaViewerModal>
      <ScrollNoFooter style={mediaViewerVisible && viewStyles.mediaViewerSafeAreaView}>
        {renderHeader( )}
        <Text className="text-2xl ml-4">{t( "Evidence" )}</Text>
        <EvidenceSection
          handleSelection={handleSelection}
          photoUris={photoUris}
          handleAddEvidence={addEvidence}
        />
        <Text className="text-2xl ml-4 mt-4">{t( "Identification" )}</Text>
        <IdentificationSection />
        <Text className="text-2xl ml-4">{t( "Other-Data" )}</Text>
        <OtherDataSection />
        <View style={viewStyles.buttonRow}>
          <Button
            onPress={saveObservation}
            testID="ObsEdit.saveButton"
            text={t( "SAVE" )}
            level="neutral"

          />
          <Button
            level="primary"
            text="UPLOAD-OBSERVATION"
            testID="ObsEdit.uploadButton"
            onPress={saveAndUploadObservation}
            disabled={!isLoggedIn}
          />
        </View>

        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          enableOverDrag={false}
          enablePanDownToClose={false}
          snapPoints={[snapPoint]}
          backdropComponent={renderBackdrop}
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
              <Text style={textStyles.evidenceWarning}>
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
              onPress={( () => bottomSheetModalRef.current?.dismiss() )}
            >
              {t( "Cancel" )}
            </Text>
          </View>
        </BottomSheetModal>
      </ScrollNoFooter>
    </BottomSheetModalProvider>
  );
};

export default ObsEdit;
