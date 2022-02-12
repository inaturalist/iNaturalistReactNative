// @flow

import React, { useState, useEffect, useCallback } from "react";
import { Text, Image, TextInput, Pressable, FlatList, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { HeaderBackButton } from "@react-navigation/elements";
import inatjs from "inaturalistjs";

import ScrollWithFooter from "../SharedComponents/ScrollWithFooter";
import useLocationName from "../../sharedHooks/useLocationName";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import { pickerSelectStyles, textStyles, imageStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import { iconicTaxaIds, iconicTaxaNames } from "../../dictionaries/iconicTaxaIds";
import { formatDateAndTime, getTimeZone } from "../../sharedHelpers/dateAndTime";
import Modal from "../SharedComponents/Modal";
import ObsEditSearch from "./ObsEditSearch";
import { getJWTToken } from "../LoginSignUp/AuthenticationService";

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
  const locationName = useLocationName( latitude, longitude );
  const dateAndTime = setDateAndTime( );

  useEffect( ( ) => {
    // prepare all obs to edit for upload
    const initialObs = obsToEdit.map( obs => {
      return {
        // object should look like Seek upload observation:
        // https://github.com/inaturalist/SeekReactNative/blob/e2df7ca77517e0c4c89f3147dc5a15ed98e31c34/utility/uploadHelpers.js#L198
        ...obs,
            // uuid: generateUUID( ),
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
        positional_accuracy: null,
        project_ids: [],
        time_zone: getTimeZone( )
      };
    } );
    // only append keys for upload when screen first loads
    if ( observations.length === 0 ) {
      setObservations( initialObs );
    }
  }, [obsToEdit, dateAndTime, latitude, longitude, locationName, observations] );

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

  const uploadObservation = async ( ) => {
    try {
      // TODO: get JWT token from staging api, not production
      const apiToken = await getJWTToken( );
      const obsToUpload = observations[currentObservation];

      const uploadParams = {
        observation: obsToUpload
      };

      const options = {
        api_token: apiToken
      };

      const response = await inatjs.observations.create( uploadParams, options );
      const { id } = response[0];
      console.log( id, "id for uploaded obs" );
    } catch ( e ) {
      console.log( JSON.stringify( e.response.status ), "couldn't upload observation" );
    }
  };

  if ( !currentObs ) { return null; }

  const displayDate = dateAndTime ? `Date & time: ${dateAndTime}` : null;
  const displayLatitude = latitude !== null && `Lat: ${formatDecimal( latitude )}`;
  const displayLongitude = longitude !== null && `Lon: ${formatDecimal( longitude )}`;

  return (
    <ScrollWithFooter>
       <Modal
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
      <Text style={textStyles.text}>
        {`${displayLatitude}, ${displayLongitude}, Acc: ${currentObs.positional_accuracy}`}
      </Text>
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
