// @flow

import { useRoute } from "@react-navigation/native";
import PhotoCarousel from "components/SharedComponents/PhotoCarousel";
import { Text, View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import { useTranslation } from "react-i18next";
import { createObservedOnStringForUpload } from "sharedHelpers/dateAndTime";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";
import { parseExifDateTime, usePhotoExif } from "sharedHooks/usePhotoExif";

import DatePicker from "./DatePicker";

type Props = {
  handleSelection: Function,
  photoUris: Array<string>,
  handleAddEvidence?: Function
}

const INITIAL_POSITIONAL_ACCURACY = 99999;
const TARGET_POSITIONAL_ACCURACY = 10;

const EvidenceSection = ( {
  handleSelection,
  handleAddEvidence,
  photoUris
}: Props ): Node => {
  const {
    currentObservation,
    updateObservationKey,
    updateObservationKeys
  } = useContext( ObsEditContext );
  const { params } = useRoute( );
  const lastScreen = params?.lastScreen;
  const mountedRef = useRef( true );
  const isNewObservation = currentObservation && !currentObservation.id;
  const isNewObservationCameraPhoto = isNewObservation && lastScreen === "StandardCamera";
  const isNewObservationsWithoutPhotos = isNewObservation && lastScreen !== "StandardCamera"
    && lastScreen !== "PhotoGallery";
  const isNewObservationImportingPhotos = isNewObservation && lastScreen === "PhotoGallery";
  const [shouldFetchLocation, setShouldFetchLocation] = useState( currentObservation
    && ( isNewObservationCameraPhoto || isNewObservationsWithoutPhotos ) );
  const [fetchingLocation, setFetchingLocation] = useState( false );
  const [positionalAccuracy, setPositionalAccuracy] = useState( INITIAL_POSITIONAL_ACCURACY );
  const [photoOriginalUris, setPhotoOriginalUris] = useState( [] );
  const [lastLocationFetchTime, setLastLocationFetchTime] = useState( 0 );
  const firstPhotoExif = usePhotoExif( photoOriginalUris.length > 0 ? photoOriginalUris[0] : null );
  const [exifDataImported, setExifDataImported] = useState( false );

  const { t } = useTranslation( );

  const formatDecimal = coordinate => coordinate && coordinate.toFixed( 6 );

  const updateObservedOn = value => updateObservationKey( "observed_on_string", value );

  const latitude = currentObservation?.latitude;
  const longitude = currentObservation?.longitude;

  // Hook version of componentWillUnmount. We use a ref to track mounted
  // state (not useState, which might get frozen in a closure for other
  // useEffects), and set it to false in the cleanup cleanup function. The
  // effect has an empty dependency array so it should only run when the
  // component mounts and when it unmounts, unlike in the cleanup effects of
  // other hooks, which will run when any of there dependency values change,
  // and maybe even before other hooks execute. If we ever need to do this
  // again we could probably wrap this into its own hook, like useMounted
  // ( ).
  useEffect( ( ) => {
    mountedRef.current = true;
    return function cleanup( ) {
      mountedRef.current = false;
    };
  }, [] );

  useEffect( ( ) => {
    if ( !currentObservation ) return;

    if ( !shouldFetchLocation ) return;

    if ( fetchingLocation ) return;

    const fetchLocation = async () => {
      // If the component is gone, you won't be able to updated it
      if ( !mountedRef.current ) return;

      if ( !shouldFetchLocation ) return;
      if ( exifDataImported ) return;

      setFetchingLocation( false );

      const location = await fetchUserLocation( );

      // If we're still receiving location updates and location is blank,
      // then we don't know where we are any more and the obs should update
      // to reflect that
      updateObservationKeys( {
        place_guess: location?.place_guess,
        latitude: location?.latitude,
        longitude: location?.longitude,
        positional_accuracy: location?.positional_accuracy
      } );

      // The local state version of positionalAccuracy needs to be a number,
      // so don't set it to
      const newPositionalAccuracy = location?.positional_accuracy || INITIAL_POSITIONAL_ACCURACY;
      setPositionalAccuracy( newPositionalAccuracy );
    };

    if (
      // If we're already fetching we don't need to fetch again
      !fetchingLocation
      // We only need to fetch when we're above the target
      && positionalAccuracy >= TARGET_POSITIONAL_ACCURACY
      // Don't fetch location more than once a second
      && Date.now() - lastLocationFetchTime >= 1000
      // Don't retrieve current location if EXIF data for the photo was imported
      && !exifDataImported
    ) {
      setFetchingLocation( true );
      setLastLocationFetchTime( Date.now() );
      fetchLocation();
    } else {
      setShouldFetchLocation( false );
    }
  }, [
    currentObservation,
    fetchingLocation,
    positionalAccuracy,
    setFetchingLocation,
    setShouldFetchLocation,
    shouldFetchLocation,
    updateObservationKeys,
    lastLocationFetchTime,
    setLastLocationFetchTime,
    exifDataImported
  ] );

  useEffect( () => {
    if ( !currentObservation ) return;

    if ( isNewObservationImportingPhotos && currentObservation.observed_on_string
      && !exifDataImported && photoUris.length > 0 ) {
      // In case of importing photos - clear out default observed_on
      updateObservationKeys( { observed_on_string: null } );
    }
  }, [currentObservation, exifDataImported,
    photoUris, updateObservationKeys, isNewObservationImportingPhotos] );

  useEffect( () => {
    if ( !currentObservation ) return;

    if ( !currentObservation.id && firstPhotoExif && !exifDataImported ) {
      // New observation with imported photo - import EXIF data from it and
      // use it to set location/observed_on data
      setExifDataImported( true );

      const newObsData = {};
      const observedOnDate = parseExifDateTime( firstPhotoExif.date );

      if ( observedOnDate ) {
        newObsData.observed_on_string = createObservedOnStringForUpload( observedOnDate );
      }

      if ( firstPhotoExif.latitude && firstPhotoExif.longitude ) {
        newObsData.latitude = firstPhotoExif.latitude;
        newObsData.longitude = firstPhotoExif.longitude;
        if ( firstPhotoExif.positional_accuracy ) {
          newObsData.positional_accuracy = firstPhotoExif.positional_accuracy;
        }
      }

      if ( Object.keys( newObsData ).length > 0 ) {
        updateObservationKeys( newObsData );
      }
    }
  }, [currentObservation, firstPhotoExif, exifDataImported, updateObservationKeys] );

  useEffect( ( ) => {
    if ( !currentObservation || !currentObservation.observationPhotos ) { return; }
    setPhotoOriginalUris( Array.from( currentObservation.observationPhotos ).map(
      obsPhoto => obsPhoto.originalPhotoUri
    ) );
  }, [currentObservation] );

  const handleDatePicked = selectedDate => {
    if ( selectedDate ) {
      const dateString = createObservedOnStringForUpload( selectedDate );
      updateObservedOn( dateString );
    }
  };

  const displayLocation = ( ) => {
    let location = "";
    if ( latitude ) {
      location += `Lat: ${formatDecimal( latitude )}`;
    }
    if ( longitude ) {
      location += `, Lon: ${formatDecimal( longitude )}`;
    }
    if ( currentObservation.positional_accuracy ) {
      location += `, Acc: ${formatDecimal( currentObservation.positional_accuracy )}`;
    }
    return location;
  };

  return (
    <View className="mx-5">
      <PhotoCarousel
        photoUris={photoUris}
        setSelectedPhotoIndex={handleSelection}
        showAddButton
        handleAddEvidence={handleAddEvidence}
      />
      <Text>{currentObservation.place_guess}</Text>
      <Text>{displayLocation( ) || t( "No-Location" )}</Text>
      <DatePicker currentObservation={currentObservation} handleDatePicked={handleDatePicked} />
    </View>
  );
};

export default EvidenceSection;
