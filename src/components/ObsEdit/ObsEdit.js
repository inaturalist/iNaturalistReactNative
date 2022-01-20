// @flow

import React, { useState, useEffect, useCallback } from "react";
import { Text, Image, TextInput, Pressable, FlatList } from "react-native";
import { useRoute } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import type { Node } from "react";

import ScrollWithFooter from "../SharedComponents/ScrollWithFooter";
import useLocationName from "../../sharedHooks/useLocationName";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import { pickerSelectStyles, textStyles, imageStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import iconicTaxaIds from "../../dictionaries/iconicTaxaIds";
import { formatDateAndTime, getTimeZone } from "../../sharedHelpers/dateAndTime";
import Modal from "../SharedComponents/Modal";
import ObsEditSearch from "./ObsEditSearch";

const ObsEdit = ( ): Node => {
  const [showModal, setModal] = useState( false );
  const [source, setSource] = useState( null );

  const openModal = useCallback( ( ) => setModal( true ), [] );
  const closeModal = useCallback( ( ) => setModal( false ), [] );

  const { params } = useRoute( );
  const { photo } = params;
  const { location } = photo;
  const latitude = location.latitude;
  const longitude = location.longitude;
  const locationName = useLocationName( latitude, longitude );
  const dateAndTime = formatDateAndTime( photo.timestamp );

  // object should look like Seek upload observation:
  // https://github.com/inaturalist/SeekReactNative/blob/e2df7ca77517e0c4c89f3147dc5a15ed98e31c34/utility/uploadHelpers.js#L198
  const [observation, setObservation] = useState( {
    // uuid: generateUUID( ),
    captive_flag: false,
    geoprivacy: "open",
    latitude,
    longitude,
    // TODO: we probably want the date time to be translated strings, not date-fns library,
    // so it will work with all translated languages on iNaturalist
    observed_on_string: dateAndTime,
    owners_identification_from_vision_requested: false,
    photo: {}, // use file uploader
    // positional_accuracy: number - how to get this from photos?
    project_ids: [],
    time_zone: getTimeZone( )
  } );

  // console.log( observation, "observation in obs edit" );

  const imageUri = { uri: photo.uri };

  const saveAndUploadObservation = ( ) => console.log( "save obs to realm; try to sync" );

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

  const formatDecimal = coordinate => coordinate.toFixed( 6 );

  const addNotes = text => {
    setObservation( {
      ...observation,
      description: text
    } );
  };

  const updateGeoprivacyStatus = value => {
    setObservation( {
      ...observation,
      geoprivacy: value
    } );
  };

  const updateCaptiveStatus = value => {
    setObservation( {
      ...observation,
      captive_flag: value
    } );
  };

  const updateTaxaId = taxaId => {
    setObservation( {
      ...observation,
      taxon_id: taxaId
    } );
  };

  const updateProjectIds = projectId => {
    const appendProjectId = observation.project_ids.concat( [projectId] );
    setObservation( {
      ...observation,
      project_ids: appendProjectId
    } );
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

  useEffect( ( ) => {
    if ( observation.place_guess ) { return; }
    if ( locationName ) {
      setObservation( {
        ...observation,
        place_guess: locationName
      } );
    }
  }, [locationName, observation] );


  const renderIconicTaxaButton = ( { item } ) => (
    <Pressable
      onPress={( ) => updateTaxaId( iconicTaxaIds[item] )}
      style={viewStyles.iconicTaxaButtons}
    >
      <Text>{item}</Text>
    </Pressable>
  );

  return (
    <ScrollWithFooter>
       <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={(
          <ObsEditSearch
            closeModal={closeModal}
            source={source}
            updateTaxaId={updateTaxaId}
            updateProjectIds={updateProjectIds}
          />
        )}
      />
      <Text style={textStyles.headerText}>1. evidence of organism</Text>
      {/* TODO: support multiple photo upload here -
      allow user to tap back to photo gallery screen and add additional photos
      while saving the observation state
      */}
      {/* TODO: allow user to tap into bigger version of photo? */}
      <Image source={imageUri} style={imageStyles.obsPhoto} />
      <Text style={textStyles.text}>{locationName}</Text>
      <Text style={textStyles.text}>{`Lat: ${formatDecimal( latitude )}, Lon: ${formatDecimal( longitude )}`}</Text>
      {/* TODO: format date and time */}
      <Text style={textStyles.text}>{`Date & time: ${dateAndTime}`}</Text>
      <Text style={textStyles.headerText}>2. identification</Text>
      {/* TODO: add suggestions screen */}
      <Pressable onPress={navToSuggestionsPage}>
        <Text style={textStyles.text}>view inat id suggestions</Text>
      </Pressable>
      <Pressable onPress={searchForTaxa}>
        <Text style={textStyles.text}>tap to search for taxa</Text>
      </Pressable>
      {/* TODO: add iconic taxa with appropriate taxa ids */}
      <Text style={textStyles.text}>quick add id</Text>
      <FlatList
        data={Object.keys( iconicTaxaIds )}
        horizontal
        renderItem={renderIconicTaxaButton}
      />
      <Text style={textStyles.headerText}>3. other data:</Text>
      <Text style={textStyles.text}>geoprivacy</Text>
      <RNPickerSelect
        onValueChange={updateGeoprivacyStatus}
        items={geoprivacyOptions}
        useNativeAndroidPickerStyle={false}
        style={pickerSelectStyles}
        value={observation.geoprivacy}
      />
      <Text style={textStyles.text}>is the organism wild?</Text>
      <RNPickerSelect
        onValueChange={updateCaptiveStatus}
        items={captiveOptions}
        useNativeAndroidPickerStyle={false}
        style={pickerSelectStyles}
        value={observation.captive_flag}
      />
      <TextInput
        keyboardType="default"
        multiline
        onChangeText={addNotes}
        placeholder="add optional notes"
        style={textStyles.notes}
      />
      {/* TODO: allow search for projects and add multiple project ids */}
      <Pressable onPress={searchForProjects}>
        <Text style={textStyles.text}>tap to add projects</Text>
      </Pressable>
      <RoundGreenButton
        buttonText="upload obs"
        testID="ObsEdit.uploadButton"
        handlePress={saveAndUploadObservation}
      />
    </ScrollWithFooter>
  );
};

export default ObsEdit;
