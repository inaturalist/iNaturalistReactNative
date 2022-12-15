// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
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
import colors from "styles/tailwindColors";

import AddEvidenceModal from "./AddEvidenceModal";
import DeleteObservationDialog from "./DeleteObservationDialog";
import EvidenceSection from "./EvidenceSection";
import IdentificationSection from "./IdentificationSection";
import ObsEditHeaderTitle from "./ObsEditHeaderTitle";
import OtherDataSection from "./OtherDataSection";
import SaveDialog from "./SaveDialog";

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
    resetObsEditContext,
    unsavedChanges
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
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const [showSaveDialog, setShowSaveDialog] = useState( false );

  const scrollToInput = node => {
    // Add a 'scroll' ref to your ScrollView
    keyboardScrollRef?.current?.scrollToFocusedInput( node );
  };

  useEffect( ( ) => {
    // when first opening an observation from ObsDetails, fetch local observation from realm
    // and set this in obsEditContext

    // If the obs requested in params is not the observation in context, clear
    // the context and set the obs requested in params as the current
    // observation
    const obsChanged = localObservation && localObservation?.uuid !== currentObservation?.uuid;
    if ( obsChanged ) {
      resetObsEditContext( );
      // need .toJSON( ) to be able to add evidence to an existing local observation
      // otherwise, get a realm error about modifying managed objects outside of a write transaction
      setObservations( [localObservation.toJSON( )] );
    }
  }, [localObservation, setObservations, resetObsEditContext, currentObservation] );

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  const discardChanges = useCallback( ( ) => {
    setObservations( [] );
    navigation.goBack( );
  }, [navigation, setObservations] );

  const handleBackButtonPress = useCallback( ( ) => {
    if ( unsavedChanges ) {
      setShowSaveDialog( true );
    } else {
      discardChanges( );
    }
  }, [unsavedChanges, discardChanges] );

  const renderBackButton = useCallback( ( ) => (
    <HeaderBackButton
      tintColor={colors.black}
      onPress={handleBackButtonPress}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{ left: -15 }}
    />
  ), [handleBackButtonPress] );

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

  const hideDialog = ( ) => setDeleteDialogVisible( false );

  const renderKebabMenu = useCallback( ( ) => (
    <KebabMenu
      visible={kebabMenuVisible}
      setVisible={setKebabMenuVisible}
    >
      <Menu.Item
        onPress={( ) => {
          setDeleteDialogVisible( true );
          setKebabMenuVisible( false );
        }}
        title={t( "Delete" )}
      />
    </KebabMenu>
  ), [kebabMenuVisible] );

  useEffect( ( ) => {
    const renderHeaderTitle = ( ) => <ObsEditHeaderTitle />;
    const headerOptions = {
      headerTitle: renderHeaderTitle,
      headerLeft: renderBackButton
    };

    // only show delete kebab menu for observations persisted to realm
    if ( localObservation ) {
      // $FlowIgnore
      headerOptions.headerRight = renderKebabMenu;
    }

    navigation.setOptions( headerOptions );
  }, [observations, navigation, renderKebabMenu, localObservation, renderBackButton] );

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
      <DeleteObservationDialog
        deleteDialogVisible={deleteDialogVisible}
        hideDialog={hideDialog}
      />
      <SaveDialog
        showSaveDialog={showSaveDialog}
        discardChanges={discardChanges}
      />
      <MediaViewerModal
        mediaViewerVisible={mediaViewerVisible}
        hideModal={hideModal}
        initialPhotoSelected={initialPhotoSelected}
        photoUris={photoUris}
        setPhotoUris={setPhotos}
      />
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
        <View className="flex-row justify-evenly">
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
