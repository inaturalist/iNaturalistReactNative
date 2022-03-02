// @flow

import React, { useState, useCallback, useContext } from "react";
import { Text, Image, TextInput, Pressable, FlatList, View, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { HeaderBackButton } from "@react-navigation/elements";
import inatjs, { FileUpload } from "inaturalistjs";
import ImageResizer from "react-native-image-resizer";

import ScrollNoFooter from "../SharedComponents/ScrollNoFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import { pickerSelectStyles, textStyles, imageStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import { iconicTaxaIds, iconicTaxaNames } from "../../dictionaries/iconicTaxaIds";
import CustomModal from "../SharedComponents/Modal";
import ObsEditSearch from "./ObsEditSearch";
import { getJWTToken } from "../LoginSignUp/AuthenticationService";
import LocationPicker from "./LocationPicker";
import CameraOptionsButton from "../SharedComponents/Buttons/CameraOptionsButton";
import { ObsEditContext } from "../../providers/contexts";
import useLocationName from "../../sharedHooks/useLocationName";

const ObsEdit = ( ): Node => {
  const {
    currentObsNumber,
    setCurrentObsNumber,
    observations,
    setObservations
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const [showModal, setModal] = useState( false );
  const [source, setSource] = useState( null );

  const openModal = useCallback( ( ) => setModal( true ), [] );
  const closeModal = useCallback( ( ) => setModal( false ), [] );

  const [showLocationPicker, setShowLocationPicker] = useState( false );

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
      if ( index === currentObsNumber ) {
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
      if ( index === currentObsNumber ) {
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

  const showNextObservation = ( ) => setCurrentObsNumber( currentObsNumber + 1 );
  const showPrevObservation = ( ) => setCurrentObsNumber( currentObsNumber - 1 );

  const renderArrowNavigation = ( ) => {
    if ( observations.length === 0 ) { return; }

    return (
      <View style={viewStyles.row}>
        <HeaderBackButton onPress={( ) => navigation.goBack( )} />
        <View style={viewStyles.row}>
          {currentObsNumber !== 0 && (
            <Pressable
              onPress={showPrevObservation}
            >
              <Text>previous obs</Text>
            </Pressable>
          )}
          <Text>{`${currentObsNumber + 1} of ${observations.length}`}</Text>
          {( currentObsNumber !== observations.length - 1 ) && (
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

  const renderCameraOptionsButton =  ( ) => <CameraOptionsButton />;

  const renderEvidence = ( { item } ) => {
    const isSound = item.uri.includes( "m4a" );
    const imageUri = { uri: item.uri };
    return (
      <Image
        source={imageUri}
        style={[imageStyles.obsPhoto, isSound && viewStyles.soundButton]}
        testID="ObsEdit.photo"
      />
    );
  };

  const currentObs = observations[currentObsNumber];
  const placeGuess = useLocationName( currentObs.latitude, currentObs.longitude );

  const renderEvidenceList = ( ) => {
    const displayEvidence = ( ) => {
      let evidence = [];

      if ( currentObs.observationPhotos ) {
        evidence = evidence.concat( currentObs.observationPhotos );
      }
      if ( currentObs.observationSounds ) {
        evidence = evidence.concat( [currentObs.observationSounds] );
      }
      return evidence;
    };
    return (
      <FlatList
        data={displayEvidence( )}
        horizontal
        renderItem={renderEvidence}
        ListFooterComponent={renderCameraOptionsButton}
      />
    );
  };

  const uploadSound = async ( soundParams, apiToken ) => {
    const options = {
      api_token: apiToken
    };

    try {
      await inatjs.observation_sounds.create( soundParams, options );
    } catch ( e ) {
      console.log( JSON.stringify( e.response ), "couldn't upload sound" );
    }
  };

  const createSoundParams = async ( id, apiToken ) => {
    const obsSoundToUpload = observations[currentObsNumber].observationSounds;
    const soundParams = {
      "observation_sound[observation_id]": id,
      "observation_sound[uuid]": obsSoundToUpload.uuid,
      file: new FileUpload( {
        uri: obsSoundToUpload.uri,
        name: "audio.m4a",
        type: "audio/m4a"
      } )
    };
    uploadSound( soundParams, apiToken );
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
    const obsPhotosToUpload = observations[currentObsNumber].observationPhotos;

    if ( !obsPhotosToUpload || obsPhotosToUpload.length === 0 ) { return; }
    for ( let i = 0; i < obsPhotosToUpload.length; i += 1 ) {
      const photoToUpload = obsPhotosToUpload[i];
      const photoUri = photoToUpload.uri;
      const resizedPhoto = await resizeImageForUpload( photoUri );

      const photoParams = {
        "observation_photo[observation_id]": id,
        "observation_photo[uuid]": photoToUpload.uuid,
        file: new FileUpload( {
          uri: resizedPhoto,
          name: "photo.jpeg",
          type: "image/jpeg"
        } )
      };
      uploadPhoto( photoParams, apiToken );
    }
  };

  const uploadObservation = async ( ) => {
    const FIELDS = {
      id: true
    };
    try {
      const apiToken = await getJWTToken( false );
      const obsToUpload = observations[currentObsNumber];

      const uploadParams = {
        // TODO: decide how to format place_guess param
        // right now it looks like street, city, state is preferred on the web
        observation: {
          ...obsToUpload,
          place_guess: placeGuess
        },
        fields: FIELDS
      };

      const options = {
        api_token: apiToken
      };

      const response = await inatjs.observations.create( uploadParams, options );
      const { id } = response.results[0];
      if ( obsToUpload.observationPhotos ) {
        createPhotoParams( id, apiToken ); // v2
      }
      if ( obsToUpload.observationSounds ) {
        createSoundParams( id, apiToken ); // v2
      }
    } catch ( e ) {
      console.log( JSON.stringify( e.response.status ), "couldn't upload observation: ", JSON.stringify( e.response ) );
    }
  };

  const openLocationPicker = ( ) => setShowLocationPicker( true );
  const closeLocationPicker = ( ) => setShowLocationPicker( false );

  const updateLocation = newLocation => {
    const updatedObs = observations.map( ( obs, index ) => {
      if ( index === currentObsNumber ) {
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

  const displayDate = currentObs.observed_on_string ? `Date & time: ${currentObs.observed_on_string}` : null;

  const displayLocation = ( ) => {
    let location = "";
    if ( currentObs.latitude ) {
      location += `Lat: ${formatDecimal( currentObs.latitude )}`;
    }
    if ( currentObs.longitude ) {
      location += `, Lon: ${formatDecimal( currentObs.longitude )}`;
    }
    if ( currentObs.positional_accuracy ) {
      location += `, Acc: ${formatDecimal( currentObs.positional_accuracy )}`;
    }
    return location;
  };

  return (
    <ScrollNoFooter>
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
      <Pressable
        onPress={openLocationPicker}
      >
        <Text style={textStyles.text}>
          {placeGuess}
        </Text>
        <Text style={textStyles.text}>
          {displayLocation( )}
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
    </ScrollNoFooter>
  );
};

export default ObsEdit;
