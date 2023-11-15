// @flow
import { useNavigation } from "@react-navigation/native";
import { createIdentification } from "api/identifications";
import type { Node } from "react";
import React, {
  useMemo,
  useReducer
} from "react";
import { Alert } from "react-native";
import Identification from "realmModels/Identification";
import ObservationPhoto from "realmModels/ObservationPhoto";
import Photo from "realmModels/Photo";
import {
  useAuthenticatedMutation,
  useCurrentUser,
  useLocalObservation,
  useTranslation
} from "sharedHooks";

import { ObsEditContext, RealmContext } from "./contexts";
import createObsReducer, {
  INITIAL_CREATE_OBS_STATE
} from "./reducers/createObsReducer";

const { useRealm } = RealmContext;

type Props = {
  children: any,
};

const ObsEditProvider = ( { children }: Props ): Node => {
  const navigation = useNavigation( );
  const realm = useRealm( );
  const currentUser = useCurrentUser( );
  const { t } = useTranslation( );

  const [state, dispatch] = useReducer( createObsReducer, INITIAL_CREATE_OBS_STATE );

  const {
    cameraPreviewUris,
    currentObservationIndex,
    galleryUris,
    observations
  } = state;

  const totalObsPhotoUris = useMemo(
    ( ) => [...cameraPreviewUris, ...galleryUris].length,
    [cameraPreviewUris, galleryUris]
  );

  const currentObservation = observations[currentObservationIndex];
  const numOfObsPhotos = currentObservation?.observationPhotos?.length || 0;

  const localObservation = useLocalObservation( currentObservation?.uuid );
  const wasSynced = localObservation?.wasSynced( );

  const createIdentificationMutation = useAuthenticatedMutation(
    ( idParams, optsWithAuth ) => createIdentification( idParams, optsWithAuth ),
    {
      onSuccess: data => {
        const belongsToCurrentUser = currentObservation?.user?.login === currentUser?.login;
        if ( belongsToCurrentUser && wasSynced ) {
          realm?.write( ( ) => {
            const localIdentifications = currentObservation?.identifications;
            const newIdentification = data[0];
            newIdentification.user = currentUser;
            newIdentification.taxon = realm?.objectForPrimaryKey(
              "Taxon",
              newIdentification.taxon.id
            ) || newIdentification.taxon;
            const realmIdentification = realm?.create( "Identification", newIdentification );
            localIdentifications.push( realmIdentification );
          } );
        }
        dispatch( { type: "SET_LOADING", loading: false } );
        navigation.navigate( "ObservationsStackNavigator", {
          screen: "ObsDetails",
          params: { uuid: currentObservation.uuid }
        } );
      },
      onError: e => {
        const showErrorAlert = err => Alert.alert( "Error", err, [{ text: t( "OK" ) }], {
          cancelable: true
        } );
        let identificationError = null;
        if ( e ) {
          identificationError = t( "Couldnt-create-identification-error", { error: e.message } );
        } else {
          identificationError = t( "Couldnt-create-identification-unknown-error" );
        }
        dispatch( { type: "SET_LOADING", loading: false } );
        return showErrorAlert( identificationError );
      }
    }
  );

  const uploadValue = useMemo( ( ) => {
    const {
      cameraRollUris,
      comment,
      groupedPhotos,
      evidenceToAdd,
      loading,
      originalCameraUrisMap,
      photoEvidenceUris,
      savingPhoto,
      selectedPhotoIndex,
      unsavedChanges
    } = state;

    const resetObsEditContext = ( ) => dispatch( { type: "RESET_OBS_CREATE" } );

    const setLoading = isLoading => dispatch( { type: "SET_LOADING", loading: isLoading } );

    const updateObservations = updatedObservations => {
      const isSavedObservation = (
        currentObservation
        && realm.objectForPrimaryKey( "Observation", currentObservation.uuid )
      );
      dispatch( {
        type: "SET_OBSERVATIONS",
        observations: updatedObservations,
        unsavedChanges: isSavedObservation
      } );
    };

    const updateObservationKeys = keysAndValues => {
      const updatedObservations = observations;
      const updatedObservation = {
        ...( currentObservation.toJSON
          ? currentObservation.toJSON( )
          : currentObservation ),
        ...keysAndValues
      };
      updatedObservations[currentObservationIndex] = updatedObservation;
      updateObservations( [...updatedObservations] );
    };

    const createId = identification => {
      const newIdentification = Identification.formatIdentification( identification, comment );
      const createRemoteIdentification = localObservation?.wasSynced( );
      if ( createRemoteIdentification ) {
        setLoading( true );
        createIdentificationMutation.mutate( {
          identification: {
            observation_id: currentObservation.uuid,
            taxon_id: newIdentification.taxon.id,
            body: newIdentification.body
          }
        } );
      } else {
        updateObservationKeys( {
          taxon: newIdentification.taxon
        } );
      }
    };

    const removePhotoFromList = ( list, photo ) => {
      const i = list.findIndex( p => p === photo );
      list.splice( i, 1 );
      return list;
    };

    const deletePhotoFromObservation = async photoUriToDelete => {
      // photos displayed in EvidenceList
      const updatedObs = currentObservation;
      if ( updatedObs ) {
        const obsPhotos = Array.from( currentObservation?.observationPhotos );
        if ( obsPhotos.length > 0 ) {
          const updatedObsPhotos = ObservationPhoto
            .deleteObservationPhoto( obsPhotos, photoUriToDelete );
          updatedObs.observationPhotos = updatedObsPhotos;
          updateObservations( [updatedObs] );
        }
      }

      // photos to show in MediaViewer
      const newPhotoEvidenceUris = removePhotoFromList( photoEvidenceUris, photoUriToDelete );
      // photos displayed in PhotoPreview
      const newCameraPreviewUris = removePhotoFromList( cameraPreviewUris, photoUriToDelete );

      // when deleting photo from StandardCamera while adding new evidence, remember to clear
      // the list of new evidence to add
      if ( evidenceToAdd.length > 0 ) {
        const updatedEvidence = removePhotoFromList( evidenceToAdd, photoUriToDelete );
        dispatch( {
          type: "DELETE_PHOTO",
          photoEvidenceUris: [...newPhotoEvidenceUris],
          cameraPreviewUris: [...newCameraPreviewUris],
          evidenceToAdd: [...updatedEvidence]
        } );
      } else {
        dispatch( {
          type: "DELETE_PHOTO",
          photoEvidenceUris: [...newPhotoEvidenceUris],
          cameraPreviewUris: [...newCameraPreviewUris],
          evidenceToAdd: []
        } );
      }

      await Photo.deletePhoto( realm, photoUriToDelete );
    };

    const setComment = newComment => dispatch( { type: "SET_COMMENT", comment: newComment } );

    const setCurrentObservationIndex = ( index, newObservations ) => dispatch( {
      type: "SET_DISPLAYED_OBSERVATION",
      currentObservationIndex: index,
      observations: newObservations || observations
    } );

    const setGroupedPhotos = uris => dispatch( {
      type: "SET_GROUPED_PHOTOS",
      groupedPhotos: uris
    } );

    const setCameraRollUris = uris => dispatch( {
      type: "SET_CAMERA_ROLL_URIS",
      cameraRollUris: uris
    } );

    const setPhotoEvidenceUris = uris => dispatch( {
      type: "SET_PHOTO_EVIDENCE_URIS",
      photoEvidenceUris: uris
    } );

    const setSelectedPhotoIndex = index => dispatch( {
      type: "SET_SELECTED_PHOTO_INDEX",
      selectedPhotoIndex: index
    } );

    const setCameraState = options => dispatch( {
      type: "SET_CAMERA_STATE",
      originalCameraUrisMap: options?.originalCameraUrisMap,
      cameraPreviewUris: options?.cameraPreviewUris,
      evidenceToAdd: options?.evidenceToAdd || evidenceToAdd
    } );

    const updatePhotoEvidenceUris = obsPhotos => {
      if ( obsPhotos?.length > photoEvidenceUris?.length ) {
        return obsPhotos.map(
          obsPhoto => obsPhoto.photo?.url || obsPhoto.photo?.localFilePath
        );
      }
      return [];
    };

    const setPhotoImporterState = options => dispatch( {
      type: "SET_PHOTO_IMPORTER_STATE",
      galleryUris: options?.galleryUris || galleryUris,
      savingPhoto: options?.savingPhoto || savingPhoto,
      evidenceToAdd: options?.evidenceToAdd || evidenceToAdd,
      groupedPhotos: options?.groupedPhotos || groupedPhotos,
      observations: options?.observations || observations,
      photoEvidenceUris: updatePhotoEvidenceUris( options?.observations?.observationPhotos )
    } );

    return {
      totalObsPhotoUris,
      cameraPreviewUris,
      cameraRollUris,
      createId,
      currentObservation,
      currentObservationIndex,
      currentUser,
      deletePhotoFromObservation,
      evidenceToAdd,
      galleryUris,
      groupedPhotos,
      loading,
      localObservation,
      navigation,
      numOfObsPhotos,
      observations,
      originalCameraUrisMap,
      photoEvidenceUris,
      realm,
      resetObsEditContext,
      selectedPhotoIndex,
      setCameraState,
      setCameraRollUris,
      setComment,
      setCurrentObservationIndex,
      setGroupedPhotos,
      setPhotoEvidenceUris,
      setPhotoImporterState,
      setSelectedPhotoIndex,
      unsavedChanges,
      updateObservationKeys,
      updateObservations
    };
  }, [
    totalObsPhotoUris,
    cameraPreviewUris,
    createIdentificationMutation,
    currentObservation,
    currentObservationIndex,
    currentUser,
    galleryUris,
    localObservation,
    navigation,
    numOfObsPhotos,
    observations,
    realm,
    state
  ] );

  return (
    <ObsEditContext.Provider value={uploadValue}>
      {children}
    </ObsEditContext.Provider>
  );
};

export default ObsEditProvider;
