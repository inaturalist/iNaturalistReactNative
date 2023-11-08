// @flow
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useNavigation } from "@react-navigation/native";
import { createIdentification } from "api/identifications";
import type { Node } from "react";
import React, {
  useMemo,
  useReducer
} from "react";
import { Alert } from "react-native";
import rnUUID from "react-native-uuid";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import Photo from "realmModels/Photo";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import { formatExifDateAsString, parseExif, writeExifToFile } from "sharedHelpers/parseExif";
import {
  useAuthenticatedMutation,
  useCurrentUser,
  useLocalObservation,
  useTranslation
} from "sharedHooks";

import { log } from "../../react-native-logs.config";
import { ObsEditContext, RealmContext } from "./contexts";
import createObsReducer, {
  INITIAL_CREATE_OBS_STATE
} from "./reducers/createObsReducer";

const { useRealm } = RealmContext;

type Props = {
  children: any,
};

const logger = log.extend( "ObsEditProvider" );

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
      selectedPhotoIndex,
      unsavedChanges
    } = state;

    const resetObsEditContext = ( ) => dispatch( { type: "RESET_OBS_CREATE" } );

    const setLoading = isLoading => dispatch( { type: "SET_LOADING", loading: isLoading } );

    const updateObservations = obs => {
      const isSavedObservation = currentObservation
        && realm.objectForPrimaryKey( "Observation", currentObservation?.uuid );
      dispatch( {
        type: "SET_OBSERVATIONS",
        observations: obs,
        unsavedChanges: isSavedObservation
      } );
    };

    const addSound = async ( ) => {
      const newObservation = await Observation.createObsWithSounds( );
      updateObservations( [newObservation] );
    };

    const addObservations = obs => updateObservations( obs );

    const createObservationNoEvidence = async ( ) => {
      const newObservation = await Observation.new( );
      updateObservations( [newObservation] );
    };

    const createObsPhotos = async ( photos, { position, local } ) => {
      let photoPosition = position;
      return Promise.all(
        photos.map( async photo => {
          const newPhoto = ObservationPhoto.new( local
            ? photo
            : photo?.image?.uri, photoPosition );
          photoPosition += 1;
          return newPhoto;
        } )
      );
    };

    const createObservationFromGalleryPhoto = async photo => {
      const firstPhotoExif = await parseExif( photo?.image?.uri );
      logger.info( `EXIF: ${JSON.stringify( firstPhotoExif, null, 2 )}` );

      const { latitude, longitude } = firstPhotoExif;
      const placeGuess = await fetchPlaceName( latitude, longitude );

      const newObservation = {
        latitude,
        longitude,
        place_guess: placeGuess,
        observed_on_string: formatExifDateAsString( firstPhotoExif.date ) || null
      };

      if ( firstPhotoExif.positional_accuracy ) {
        // $FlowIgnore
        newObservation.positional_accuracy = firstPhotoExif.positional_accuracy;
      }
      return Observation.new( newObservation );
    };

    const createObservationWithPhotos = async photos => {
      const newLocalObs = await createObservationFromGalleryPhoto( photos[0] );
      newLocalObs.observationPhotos = await createObsPhotos( photos, { position: 0 } );
      return newLocalObs;
    };

    const createObservationsFromGroupedPhotos = async groupedPhotoObservations => {
      const newObservations = await Promise.all( groupedPhotoObservations.map(
        async ( { photos } ) => createObservationWithPhotos( photos )
      ) );
      updateObservations( newObservations );
    };

    const createObservationFromGallery = async photo => {
      const newObservation = await createObservationWithPhotos( [photo] );
      updateObservations( [newObservation] );
    };

    const appendObsPhotos = obsPhotos => {
      // need empty case for when a user creates an observation with no photos,
      // then tries to add photos to observation later
      const currentObservationPhotos = currentObservation?.observationPhotos || [];

      const updatedObs = currentObservation;
      updatedObs.observationPhotos = [...currentObservationPhotos, ...obsPhotos];
      updateObservations( [updatedObs] );
      // clear additional evidence
      dispatch( { type: "CLEAR_ADDITIONAL_EVIDENCE" } );
    };

    const addGalleryPhotosToCurrentObservation = async photos => {
      dispatch( { type: "SET_SAVING_PHOTO", savingPhoto: true } );
      const obsPhotos = await createObsPhotos( photos, { position: numOfObsPhotos } );
      appendObsPhotos( obsPhotos );
      dispatch( { type: "SET_SAVING_PHOTO", savingPhoto: false } );
    };

    // Save URIs to camera gallery (if a photo was taken using the app,
    // we want it accessible in the camera's folder, as if the user has taken those photos
    // via their own camera app).
    const savePhotosToCameraGallery = async uris => {
      const savedUris = await Promise.all( uris.map( async uri => {
        // Find original camera URI of each scaled-down photo
        const cameraUri = originalCameraUrisMap[uri];

        if ( !cameraUri ) {
          console.error( `Couldn't find original camera URI for: ${uri}` );
        }
        logger.info( "savePhotosToCameraGallery, saving cameraUri: ", cameraUri );
        return CameraRoll.save( cameraUri, { type: "photo", album: "Camera" } );
      } ) );

      logger.info( "savePhotosToCameraGallery, savedUris: ", savedUris );
      // Save these camera roll URIs, so later on observation editor can update
      // the EXIF metadata of these photos, once we retrieve a location.
      dispatch( { type: "SET_CAMERA_ROLL_URIS", cameraRollUris: savedUris } );
    };

    const writeExifToCameraRollPhotos = async exif => {
      if ( !cameraRollUris || cameraRollUris.length === 0 || !currentObservation ) {
        return;
      }
      // Update all photos taken via the app with the new fetched location.
      cameraRollUris.forEach( uri => {
        logger.info( "writeExifToCameraRollPhotos, writing exif for uri: ", uri );
        writeExifToFile( uri, exif );
      } );
    };

    const createObsWithCameraPhotos = async ( localFilePaths, localTaxon ) => {
      const newObservation = await Observation.new( );
      newObservation.observationPhotos = await createObsPhotos( localFilePaths, {
        position: 0,
        local: true
      } );

      if ( localTaxon ) {
        newObservation.taxon = localTaxon;
      }
      updateObservations( [newObservation] );
      logger.info(
        "createObsWithCameraPhotos, calling savePhotosToCameraGallery with paths: ",
        localFilePaths
      );
      // TODO catch the error that gets raised here if the user denies gallery permission
      await savePhotosToCameraGallery( localFilePaths );
    };

    const addCameraPhotosToCurrentObservation = async localFilePaths => {
      dispatch( { type: "SET_SAVING_PHOTO", savingPhoto: true } );
      const obsPhotos = await createObsPhotos( localFilePaths, {
        position: numOfObsPhotos,
        local: true
      } );
      appendObsPhotos( obsPhotos );
      logger.info(
        "addCameraPhotosToCurrentObservation, calling savePhotosToCameraGallery with paths: ",
        localFilePaths
      );
      await savePhotosToCameraGallery( localFilePaths );
      dispatch( { type: "SET_SAVING_PHOTO", savingPhoto: false } );
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

    const formatIdentification = taxon => {
      const newIdent = {
        uuid: rnUUID.v4(),
        body: comment,
        taxon
      };

      return newIdent;
    };

    const createId = identification => {
      setLoading( true );
      const newIdentification = formatIdentification( identification );
      const createRemoteIdentification = localObservation?.wasSynced( );
      if ( createRemoteIdentification ) {
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

    const deleteLocalObservation = uuid => {
      const localObsToDelete = realm.objectForPrimaryKey( "Observation", uuid );
      if ( !localObsToDelete ) { return; }
      realm?.write( ( ) => {
        realm?.delete( localObsToDelete );
      } );
    };

    function ensureRealm( ) {
      if ( !realm ) {
        throw new Error( "Gack, tried to save an observation without realm!" );
      }
    }

    const saveObservation = async observation => {
      ensureRealm( );
      await writeExifToCameraRollPhotos( {
        latitude: observation.latitude,
        longitude: observation.longitude,
        positional_accuracy: observation.positionalAccuracy
      } );
      return Observation.saveLocalObservationForUpload( observation, realm );
    };

    const saveCurrentObservation = async ( ) => saveObservation( currentObservation );

    const saveAllObservations = async ( ) => {
      setLoading( true );
      ensureRealm( );
      await Promise.all( observations.map( async observation => {
        // Note that this should only happen after import when ObsEdit has
        // multiple observations to save, none of which should have
        // corresponding photos in cameraRollPhotos, so there's no need to
        // write EXIF for those.
        await Observation.saveLocalObservationForUpload( observation, realm );
      } ) );
      setLoading( false );
    };

    const setNextScreen = async ( { type }: Object ) => {
      const savedObservation = await saveCurrentObservation( );
      if ( type === "upload" ) {
        // navigate to ObsList and start upload with uuid
        navigation.navigate( "TabNavigator", {
          screen: "ObservationsStackNavigator",
          params: {
            screen: "ObsList",
            uuid: savedObservation.uuid
          }
        } );
      }

      if ( observations.length === 1 ) {
        navigation.navigate( "TabNavigator", {
          screen: "ObservationsStackNavigator",
          params: {
            screen: "ObsList"
          }
        } );
      } else if ( currentObservationIndex === observations.length - 1 ) {
        observations.pop( );
        dispatch( {
          type: "SET_DISPLAYED_OBSERVATION",
          currentObservationIndex: currentObservationIndex - 1,
          observations
        } );
      } else {
        observations.splice( currentObservationIndex, 1 );
        // this seems necessary for rerendering the ObsEdit screen
        dispatch( {
          type: "SET_DISPLAYED_OBSERVATION",
          currentObservationIndex,
          observations: []
        } );
        console.log( currentObservationIndex, observations.length, "length of obs" );
        updateObservations( observations );

        console.log( currentObservationIndex, observations.length, "length of obs1" );
      }
    };

    const removePhotoFromList = ( list, photo ) => {
      const i = list.findIndex( p => p === photo );
      list.splice( i, 1 );
      return list;
    };

    const deleteObservationPhoto = ( list, photo ) => {
      const i = list.findIndex(
        p => p.photo.localFilePath === photo || p.originalPhotoUri === photo
      );
      list.splice( i, 1 );
      return list;
    };

    const deletePhotoFromObservation = async photoUriToDelete => {
      // photos displayed in EvidenceList
      const updatedObs = currentObservation;
      if ( updatedObs ) {
        const obsPhotos = Array.from( currentObservation?.observationPhotos );
        if ( obsPhotos.length > 0 ) {
          const updatedObsPhotos = deleteObservationPhoto( obsPhotos, photoUriToDelete );
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

    const setCurrentObservationIndex = index => dispatch( {
      type: "SET_DISPLAYED_OBSERVATION",
      currentObservationIndex: index,
      observations
    } );

    const setGalleryUris = uris => dispatch( { type: "SET_GALLERY_URIS", galleryUris: uris } );

    const setGroupedPhotos = uris => dispatch( {
      type: "SET_GROUPED_PHOTOS",
      groupedPhotos: uris
    } );

    const setCameraPreviewUris = uris => dispatch( {
      type: "SET_CAMERA_PREVIEW_URIS",
      cameraPreviewUris: uris
    } );

    const setEvidenceToAdd = uris => dispatch( {
      type: "SET_EVIDENCE_TO_ADD",
      evidenceToAdd: uris
    } );

    const setOriginalCameraUrisMap = uriMap => dispatch( {
      type: "SET_ORIGINAL_CAMERA_URIS_MAP",
      originalCameraUrisMap: uriMap
    } );

    const setPhotoEvidenceUris = uris => dispatch( {
      type: "SET_PHOTO_EVIDENCE_URIS",
      photoEvidenceUris: uris
    } );

    const setSelectedPhotoIndex = index => dispatch( {
      type: "SET_SELECTED_PHOTO_INDEX",
      selectedPhotoIndex: index
    } );

    return {
      addCameraPhotosToCurrentObservation,
      addGalleryPhotosToCurrentObservation,
      addObservations,
      addSound,
      totalObsPhotoUris,
      cameraPreviewUris,
      cameraRollUris,
      createId,
      createIdentificationMutation,
      createObservationFromGallery,
      createObservationNoEvidence,
      createObservationsFromGroupedPhotos,
      createObsWithCameraPhotos,
      currentObservation,
      currentObservationIndex,
      currentUser,
      deleteLocalObservation,
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
      saveAllObservations,
      saveCurrentObservation,
      selectedPhotoIndex,
      setCameraPreviewUris,
      setComment,
      setCurrentObservationIndex,
      setEvidenceToAdd,
      setGalleryUris,
      setGroupedPhotos,
      setNextScreen,
      updateObservations,
      setOriginalCameraUrisMap,
      setPhotoEvidenceUris,
      setSelectedPhotoIndex,
      unsavedChanges,
      updateObservationKeys
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
