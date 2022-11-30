// @flow

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import MediaViewer from "components/MediaViewer/MediaViewer";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import Button from "components/SharedComponents/Buttons/Button";
import KebabMenu from "components/SharedComponents/KebabMenu";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useContext, useEffect, useRef,
  useState
} from "react";
import { BackHandler } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Menu } from "react-native-paper";
import Photo from "realmModels/Photo";
import useLocalObservation from "sharedHooks/useLocalObservation";
import useLoggedIn from "sharedHooks/useLoggedIn";
import { viewStyles } from "styles/obsEdit/obsEdit";

import AddEvidenceModal from "./AddEvidenceModal";
import DeleteObservationDialog from "./DeleteObservationDialog";
import EvidenceSection from "./EvidenceSection";
import IdentificationSection from "./IdentificationSection";
import ObsEditHeaderTitle from "./ObsEditHeaderTitle";
import OtherDataSection from "./OtherDataSection";

const { useRealm } = RealmContext;

const ObsEdit = ( ): Node => {
  const keyboardScrollRef = useRef( null );
  const [deleteDialogVisible, setDeleteDialogVisible] = useState( false );
  const {
    currentObservation,
    observations,
    saveObservation,
    saveAndUploadObservation,
    setObservations,
    resetObsEditContext
  } = useContext( ObsEditContext );
  const obsPhotos = currentObservation?.observationPhotos;
  const photoUris = obsPhotos ? Array.from( obsPhotos ).map(
    obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
  ) : [];
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const localObservation = useLocalObservation( params?.uuid );
  const isLoggedIn = useLoggedIn( );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [initialPhotoSelected, setInitialPhotoSelected] = useState( null );
  const [showAddEvidenceModal, setShowAddEvidenceModal] = useState( false );

  const scrollToInput = node => {
    // Add a 'scroll' ref to your ScrollView
    keyboardScrollRef?.current?.scrollToFocusedInput( node );
  };

  useEffect( ( ) => {
    // when opening an observation from ObsDetails, fetch the local
    // observation from realm
    if ( localObservation ) {
      resetObsEditContext( );
      setObservations( [localObservation] );
    }
  }, [localObservation, setObservations, resetObsEditContext] );

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  const handleBackButtonPress = useCallback( async ( ) => {
    setObservations( [] );
    navigation.goBack( );
  }, [navigation, setObservations] );

  useFocusEffect(
    useCallback( ( ) => {
      // make sure an Android user cannot back out to MyObservations with the back arrow
      // and see a stale observation context state
      const onBackPress = ( ) => {
        handleBackButtonPress( );
        return true;
      };

      BackHandler.addEventListener( "hardwareBackPress", onBackPress );

      return ( ) => BackHandler.removeEventListener( "hardwareBackPress", onBackPress );
    }, [handleBackButtonPress] )
  );

  const showDialog = ( ) => setDeleteDialogVisible( true );
  const hideDialog = ( ) => setDeleteDialogVisible( false );
  const renderKebabMenu = useCallback( ( ) => (
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
  ), [deleteDialogVisible] );

  useEffect( ( ) => {
    const renderHeaderTitle = ( ) => <ObsEditHeaderTitle />;

    navigation.setOptions( {
      headerTitle: renderHeaderTitle,
      headerRight: renderKebabMenu
    } );
  }, [observations, navigation, renderKebabMenu] );

  const realm = useRealm( );

  const setPhotos = uris => {
    const updatedObservations = observations;
    const updatedObsPhotos = Array.from( currentObservation.observationPhotos )
      .filter( obsPhoto => {
        const { photo } = obsPhoto;
        if ( uris.includes( photo.url || photo.localFilePath ) ) {
          return obsPhoto;
        }
        return false;
      } );
    // when updatedObsPhotos is an empty array, Realm apparently writes to the
    // db immediately when you assign, so if you don't do this in write
    // callback it raises an exception
    realm?.write( ( ) => {
      currentObservation.observationPhotos = updatedObsPhotos;
    } );
    setObservations( [...updatedObservations] );
  };

  const handleSelection = photo => {
    setInitialPhotoSelected( photo );
    showModal( );
  };

  const addEvidence = ( ) => setShowAddEvidenceModal( true );

  if ( !currentObservation ) { return null; }

  return (
    <>
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
      <KeyboardAwareScrollView className="bg-white">
        <Text className="text-2xl ml-4">{t( "Evidence" )}</Text>
        <EvidenceSection
          handleSelection={handleSelection}
          photoUris={photoUris}
          handleAddEvidence={addEvidence}
        />
        <Text className="text-2xl ml-4 mt-4">{t( "Identification" )}</Text>
        <IdentificationSection />
        <Text className="text-2xl ml-4">{t( "Other-Data" )}</Text>
        <OtherDataSection scrollToInput={scrollToInput} />
        <View style={viewStyles.buttonRow}>
          <Button
            onPress={saveObservation}
            testID="ObsEdit.saveButton"
            text={t( "SAVE" )}
            level="neutral"

          />
          <Button
            level="primary"
            text={t( "UPLOAD-OBSERVATION" )}
            testID="ObsEdit.uploadButton"
            onPress={saveAndUploadObservation}
            disabled={!isLoggedIn}
          />
        </View>
        <AddEvidenceModal
          showAddEvidenceModal={showAddEvidenceModal}
          setShowAddEvidenceModal={setShowAddEvidenceModal}
          photoUris={photoUris}
        />
      </KeyboardAwareScrollView>
    </>
  );
};

export default ObsEdit;
