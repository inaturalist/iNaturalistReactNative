// @flow

import React, { useState, useEffect, useCallback } from "react";
import { Text, Image, TextInput, Pressable, FlatList, View, Modal } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { HeaderBackButton } from "@react-navigation/elements";
import inatjs, { FileUpload } from "inaturalistjs";
import uuid from "react-native-uuid";
import ImageResizer from "react-native-image-resizer";

import ScrollWithFooter from "../SharedComponents/ScrollWithFooter";
import useLocationName from "../../sharedHooks/useLocationName";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import { pickerSelectStyles, textStyles, imageStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import { iconicTaxaIds, iconicTaxaNames } from "../../dictionaries/iconicTaxaIds";
import { formatDateAndTime, getTimeZone } from "../../sharedHelpers/dateAndTime";
import CustomModal from "../SharedComponents/Modal";
import ObsEditSearch from "./ObsEditSearch";
import { getJWTToken } from "../LoginSignUp/AuthenticationService";
import LocationPicker from "./LocationPicker";

const ObsEdit = ( ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const [showModal, setModal] = useState( false );
  const [source, setSource] = useState( null );

  const openModal = useCallback( ( ) => setModal( true ), [] );
  const closeModal = useCallback( ( ) => setModal( false ), [] );

  const { params } = useRoute( );
  const { photo, obsToEdit } = params;

  const [observations, setObservations] = useState( [] );
  const [currentObservation, setCurrentObservation] = useState( 0 );
  const [showLocationPicker, setShowLocationPicker] = useState( false );

  const setFirstPhoto = ( ) => {
    if ( obsToEdit && obsToEdit[currentObservation]
      && obsToEdit[currentObservation].observationPhotos ) {
        return obsToEdit[currentObservation].observationPhotos[0];
    } else if ( photo ) {
      return photo;
    }
    return null;
  };

  const firstPhoto = setFirstPhoto( );

  const setDateAndTime = ( ) => {
    if ( firstPhoto && firstPhoto.timestamp ) {
      return formatDateAndTime( firstPhoto.timestamp );
    }
    if ( firstPhoto && firstPhoto.DateTimeOriginal ) {
      return firstPhoto.DateTimeOriginal;
    }
    return null;
  };

  const location = ( firstPhoto && firstPhoto.location ) || null;
  const latitude = ( location && location.latitude ) || null;
  const longitude = ( location && location.longitude ) || null;
  const accuracy = ( location && location.accuracy ) || null;
  const locationName = useLocationName( latitude, longitude );
  const dateAndTime = setDateAndTime( );

  useEffect( ( ) => {
    // prepare all obs to edit for upload
    const initialObs = obsToEdit.map( obs => {
      return {
        // object should look like Seek upload observation:
        // https://github.com/inaturalist/SeekReactNative/blob/e2df7ca77517e0c4c89f3147dc5a15ed98e31c34/utility/uploadHelpers.js#L198
        ...obs,
        uuid: uuid.v4( ),
        captive_flag: false,
        geoprivacy: "open",
        latitude,
        longitude,
        // TODO: we probably want the date time to be translated strings, not date-fns library,
        // so it will work with all translated languages on iNaturalist
        observed_on_string: dateAndTime,
        owners_identification_from_vision_requested: false,
        // photo: {}, // use file uploader
        place_guess: locationName || null,
        positional_accuracy: accuracy,
        project_ids: [],
        time_zone: getTimeZone( )
      };
    } );
    // only append keys for upload when screen first loads
    if ( observations.length === 0 ) {
      setObservations( initialObs );
    }
  }, [obsToEdit, dateAndTime, latitude, longitude, locationName, observations, accuracy] );

  const geoprivacyOptions = [{
    label: "open",
    value: "open"
  },
  {
    label: "obscured",
    value: "obscured"
  },
  {
    label: "private",
    value: "private"
  }];

  // opposite of Seek (asking if wild, not if captive)
  const captiveOptions = [{
    label: "no",
    value: true
  },
  {
    label: "yes",
    value: false
  }];

  const formatDecimal = coordinate => coordinate && coordinate.toFixed( 6 );

  const updateObservationKey = ( key, value ) => {
    const updatedObs = observations.map( ( obs, index ) => {
      if ( index === currentObservation ) {
        return {
          ...obs,
          // $FlowFixMe
          [key]: value
        };
      } else {
        return obs;
      }
    } );
    setObservations( updatedObs );
  };

  const addNotes = text => updateObservationKey( "description", text );
  const updateGeoprivacyStatus = value => updateObservationKey( "geoprivacy", value );
  const updateCaptiveStatus = value => updateObservationKey( "captive_flag", value );
  const updateTaxaId = taxaId => updateObservationKey( "taxon_id", taxaId );

  const updateProjectIds = projectId => {
    const updatedObs = observations.map( ( obs, index ) => {
      if ( index === currentObservation ) {
        return {
          ...obs,
          project_ids: obs.project_ids.concat( [projectId] )
        };
      } else {
        return obs;
      }
    } );
    setObservations( updatedObs );
  };

  const navToSuggestionsPage = ( ) => console.log( "nav to suggestions page" );

  const searchForTaxa = ( ) => {
    setSource( "taxa" );
    openModal( );
  };

  const searchForProjects = ( ) => {
    setSource( "projects" );
    openModal( );
  };


  const renderIconicTaxaButton = ( { item } ) => {
    const id = iconicTaxaIds[item];
    return (
      <Pressable
        onPress={( ) => updateTaxaId( id )}
        style={viewStyles.iconicTaxaButtons}
      >
        <Text>{ t( iconicTaxaNames[id] ) }</Text>
      </Pressable>
    );
  };

  const showNextObservation = ( ) => setCurrentObservation( currentObservation + 1 );
  const showPrevObservation = ( ) => setCurrentObservation( currentObservation - 1 );

  const renderArrowNavigation = ( ) => {
    if ( obsToEdit.length === 0 ) { return; }

    return (
      <View style={viewStyles.row}>
        <HeaderBackButton onPress={( ) => navigation.goBack( )} />
        <View style={viewStyles.row}>
          {currentObservation !== 0 && (
            <Pressable
              onPress={showPrevObservation}
            >
              <Text>previous obs</Text>
            </Pressable>
          )}
          <Text>{`${currentObservation + 1} of ${observations.length}`}</Text>
          {( currentObservation !== obsToEdit.length - 1 ) && (
            <Pressable
              onPress={showNextObservation}
            >
              <Text>next obs</Text>
            </Pressable>
          )}
        </View>
        <View />
      </View>
    );
  };

  const renderObsPhotos = ( { item } ) => {
    const imageUri = { uri: item.uri };
    return <Image source={imageUri} style={imageStyles.obsPhoto} testID="ObsEdit.photo" />;
  };

  const currentObs = observations[currentObservation];

  const renderEvidenceList = ( ) => {
    if ( currentObs.observationPhotos ) {
      return (
        <FlatList
          data={currentObs.observationPhotos}
          horizontal
          renderItem={renderObsPhotos}
        />
      );
    } else if ( currentObs.observationSounds ) {
      return <Text>display sound recording</Text>;
    }
  };

  const resizeImage = async ( path, width, height?, outputPath? ) => {
    try {
      const { uri } = await ImageResizer.createResizedImage(
        path,
        width,
        height || width, // height
        "JPEG", // compressFormat
        100, // quality
        0, // rotation
        // $FlowFixMe
        outputPath, // outputPath
        true // keep metadata
      );

      return uri;
    } catch ( e ) {
      console.log( e, "error resizing image" );
      return "";
    }
  };

  const resizeImageForUpload = async ( uri ) => {
    const maxUploadSize = 2048;
    return await resizeImage( uri, maxUploadSize, maxUploadSize );
  };

  const uploadPhoto = async ( photoParams, apiToken ) => {
    const options = {
      api_token: apiToken
    };

    try {
      await inatjs.observation_photos.create( photoParams, options );
    } catch ( e ) {
      console.log( JSON.stringify( e.response ), "couldn't upload photo" );
    }
  };

  const createPhotoParams = async ( id, apiToken ) => {
    const obsPhotosToUpload = observations[currentObservation].observationPhotos;
    for ( let i = 0; i < obsPhotosToUpload.length; i += 1 ) {
      const photoToUpload = obsPhotosToUpload[i];
      const photoUri = photoToUpload.uri;
      console.log( photoUri, "photo to resize" );
      const resizedPhoto = await resizeImageForUpload( photoUri );
      console.log( resizedPhoto, "resized photo" );
      const photoParams = {
        "observation_photo[observation_id]": id,
        "observation_photo[uuid]": photoToUpload.uuid,
        file: new FileUpload( {
          uri: resizedPhoto,
          name: "photo.jpeg",
          type: "image/jpeg"
        } )
      };
      console.log( photoParams, "create photo params" );
      uploadPhoto( photoParams, apiToken );
    }
  };

  const uploadObservation = async ( ) => {
    const FIELDS = {
      id: true
    };
    try {
      const apiToken = await getJWTToken( false );
      const obsToUpload = observations[currentObservation];

      const uploadParams = {
        observation: obsToUpload,
        fields: FIELDS
      };

      const options = {
        api_token: apiToken
      };

      const response = await inatjs.observations.create( uploadParams, options );
      console.log( response.id ); // v1
      createPhotoParams( response.id, apiToken ); // v1
      // console.log( results[0].id, "response id" );
      // createPhotoParams( results[0].id );
    } catch ( e ) {
      console.log( JSON.stringify( e.response.status ), "couldn't upload observation: ", JSON.stringify( e.response ) );
    }
  };

  const openLocationPicker = ( ) => setShowLocationPicker( true );
  const closeLocationPicker = ( ) => setShowLocationPicker( false );

  const updateLocation = newLocation => {
    const updatedObs = observations.map( ( obs, index ) => {
      if ( index === currentObservation ) {
        return {
          ...obs,
          // $FlowFixMe
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          place_guess: newLocation.placeGuess
        };
      } else {
        return obs;
      }
    } );
    setObservations( updatedObs );
  };

  const renderLocationPickerModal = ( ) => (
    <Modal visible={showLocationPicker}>
      <LocationPicker
        closeLocationPicker={closeLocationPicker}
        updateLocation={updateLocation}
      />
    </Modal>
  );

  if ( !currentObs ) { return null; }

  const displayDate = dateAndTime ? `Date & time: ${dateAndTime}` : null;
  const displayLatitude = currentObs.latitude !== null && `Lat: ${formatDecimal( currentObs.latitude )}`;
  const displayLongitude = currentObs.longitude !== null && `Lon: ${formatDecimal( currentObs.longitude )}`;
  const displayAccuracy = currentObs.accuracy !== null && `Acc: ${formatDecimal( currentObs.positional_accuracy )}`;

  return (
    <ScrollWithFooter>
      {renderLocationPickerModal( )}
       <CustomModal
        showModal={showModal}
        closeModal={closeModal}
        modal={(
          <ObsEditSearch
            closeModal={closeModal}
            // $FlowFixMe
            source={source}
            updateTaxaId={updateTaxaId}
            updateProjectIds={updateProjectIds}
          />
        )}
      />
      {renderArrowNavigation( )}
      <Text style={textStyles.headerText}>{ t( "Evidence" )}</Text>
      {/* TODO: allow user to tap into bigger version of photo (crop screen) */}
      {renderEvidenceList( )}
      <Text style={textStyles.text}>{locationName}</Text>
      <Pressable
        onPress={openLocationPicker}
      >
        <Text style={textStyles.text}>
          {`${displayLatitude}, ${displayLongitude}, ${displayAccuracy}`}
        </Text>
      </Pressable>
      {/* TODO: format date and time */}
      <Text style={textStyles.text} testID="ObsEdit.time">{displayDate}</Text>
      <Text style={textStyles.headerText}>{ t( "Identification" )}</Text>
      {/* TODO: add suggestions screen */}
      <Pressable onPress={navToSuggestionsPage}>
        <Text style={textStyles.text}>view inat id suggestions</Text>
      </Pressable>
      <Pressable onPress={searchForTaxa}>
        <Text style={textStyles.text}>tap to search for taxa</Text>
      </Pressable>
      {/* TODO: add iconic taxa with appropriate taxa ids */}
      <Text style={textStyles.text}>
        {currentObs.taxon_id && t( iconicTaxaNames[currentObs.taxon_id] )}
      </Text>
      <FlatList
        data={Object.keys( iconicTaxaIds )}
        horizontal
        renderItem={renderIconicTaxaButton}
      />
      <Text style={textStyles.headerText}>{ t( "Other-Data" )}</Text>
      <Text style={textStyles.text}>geoprivacy</Text>
      <RNPickerSelect
        onValueChange={updateGeoprivacyStatus}
        items={geoprivacyOptions}
        useNativeAndroidPickerStyle={false}
        style={pickerSelectStyles}
        value={currentObs.geoprivacy}
      />
      <Text style={textStyles.text}>is the organism wild?</Text>
      <RNPickerSelect
        onValueChange={updateCaptiveStatus}
        items={captiveOptions}
        useNativeAndroidPickerStyle={false}
        style={pickerSelectStyles}
        value={currentObs.captive_flag}
      />
      <Pressable onPress={searchForProjects}>
        <Text style={textStyles.text}>tap to add projects</Text>
      </Pressable>
      <TextInput
        keyboardType="default"
        multiline
        onChangeText={addNotes}
        placeholder="add optional notes"
        style={textStyles.notes}
        testID="ObsEdit.notes"
      />
      <RoundGreenButton
        buttonText="upload obs"
        testID="ObsEdit.uploadButton"
        handlePress={uploadObservation}
      />
    </ScrollWithFooter>
  );
};

export default ObsEdit;
