// @flow

import React, { useState, useCallback, useContext } from "react";
import { Text, Pressable, FlatList, View, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { HeaderBackButton } from "@react-navigation/elements";

import ScrollNoFooter from "../SharedComponents/ScrollNoFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import { pickerSelectStyles, textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import { iconicTaxaIds, iconicTaxaNames } from "../../dictionaries/iconicTaxaIds";
import CustomModal from "../SharedComponents/Modal";
import ObsEditSearch from "./ObsEditSearch";
import LocationPicker from "./LocationPicker";
import { ObsEditContext } from "../../providers/contexts";
import useLocationName from "../../sharedHooks/useLocationName";
import EvidenceList from "./EvidenceList";
import { useLoggedIn } from "../../sharedHooks/useLoggedIn";
import DatePicker from "./DatePicker";
import TranslatedText from "../SharedComponents/TranslatedText";
import Notes from "./Notes";
import BottomModal from "./BottomModal";
// import uploadObservation from "./helpers/uploadObservation";

const ObsEdit = ( ): Node => {
  const {
    currentObsNumber,
    setCurrentObsNumber,
    observations,
    setObservations,
    updateObservationKey,
    identification,
    saveObservation,
    saveAndUploadObservation
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const [showModal, setModal] = useState( false );
  const [showBottomModal, setBottomModal] = useState( false );
  const [source, setSource] = useState( null );
  const isLoggedIn = useLoggedIn( );

  console.log( observations.length, currentObsNumber, "obs number and length in obsedit" );

  const openModal = useCallback( ( ) => setModal( true ), [] );
  const closeModal = useCallback( ( ) => setModal( false ), [] );
  const openBottomModal = useCallback( ( ) => setBottomModal( true ), [] );
  const closeBottomModal = useCallback( ( ) => setBottomModal( false ), [] );

  const [showLocationPicker, setShowLocationPicker] = useState( false );

  const geoprivacyOptions = [{
    label: t( "Open" ),
    value: "open"
  },
  {
    label: t( "Obscured" ),
    value: "obscured"
  },
  {
    label: t( "Private" ),
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

  const addNotes = text => updateObservationKey( "description", text );
  const updateGeoprivacyStatus = value => updateObservationKey( "geoprivacy", value );
  const updateCaptiveStatus = value => updateObservationKey( "captive_flag", value );
  const updateTaxaId = taxaId => updateObservationKey( "taxon_id", taxaId );
  const updateObservedOn = value => updateObservationKey( "observed_on_string", value );

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

  const navToSuggestionsPage = ( ) => navigation.navigate( "Suggestions" );

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

    const handleBackButtonPress = ( ) => {
      openBottomModal( );
      // show modal to dissuade user from going back
      // navigation.goBack( );
    };

    return (
      <View style={viewStyles.row}>
        <HeaderBackButton onPress={handleBackButtonPress} />
        {observations.length === 1
          ? <TranslatedText text="New-Observation" /> : (
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
          )}
        <View />
      </View>
    );
  };

  const currentObs = observations[currentObsNumber];
  const latitude = currentObs && currentObs.latitude;
  const longitude = currentObs && currentObs.longitude;

  const placeGuess = useLocationName( latitude, longitude );

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

  const handleDatePicked = ( selectedDate ) => {
    if ( selectedDate ) {
      updateObservedOn( selectedDate );
    }
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

  // TODO: make sure observed_on_string uses same time format with all types of evidence (camera, gallery, etc)
  const displayDate = currentObs.observed_on_string ? `${currentObs.observed_on_string}` : null;

  const displayLocation = ( ) => {
    let location = "";
    if ( latitude ) {
      location += `Lat: ${formatDecimal( latitude )}`;
    }
    if ( longitude ) {
      location += `, Lon: ${formatDecimal( longitude )}`;
    }
    if ( currentObs.positional_accuracy ) {
      location += `, Acc: ${formatDecimal( currentObs.positional_accuracy )}`;
    }
    return location;
  };

  const updateObsAndCloseModal = id => {
    if ( source === "taxa" ) {
      updateTaxaId( id );
    } else {
      // TODO: need somewhere to display which projects a user has joined
      updateProjectIds( id );
    }
    closeModal( );
  };

  const displayIdentification = ( ) => {
    if ( identification ) {
      return (
        <View style={viewStyles.row}>
          <View>
            <Text style={textStyles.text}>
              {identification.preferred_common_name}
            </Text>
            <Text style={textStyles.text}>
              {identification.name}
            </Text>
          </View>
          <Pressable
            onPress={navToSuggestionsPage}
          >
            <Text style={textStyles.text}>edit</Text>
          </Pressable>
        </View>
      );
    } else {
      return (
        <>
          <RoundGreenButton
            handlePress={navToSuggestionsPage}
            buttonText="View Identification Suggestions"
            testID="ObsEdit.Suggestions"
          />
          <Text style={textStyles.text}>
            {currentObs.taxon_id && t( iconicTaxaNames[currentObs.taxon_id] )}
          </Text>
        </>
      );
    }
  };

  return (
    <ScrollNoFooter>
      <CustomModal
        showModal={showBottomModal}
        closeModal={closeBottomModal}
        modal={(
          <BottomModal />
        )}
        style={viewStyles.noMargin}
      />
      {renderLocationPickerModal( )}
      <CustomModal
        showModal={showModal}
        closeModal={closeModal}
        modal={(
          <ObsEditSearch
            // $FlowFixMe
            source={source}
            handlePress={updateObsAndCloseModal}
          />
        )}
      />
      {renderArrowNavigation( )}
      <TranslatedText style={textStyles.headerText} text="Evidence" />
      {/* TODO: allow user to tap into bigger version of photo (crop screen) */}
      <EvidenceList currentObs={currentObs} showCameraOptions />
      <Pressable
        onPress={openLocationPicker}
      >
        <Text style={textStyles.text}>
          {currentObs.place_guess || t( "Add-Location" )}
        </Text>
        <Text style={textStyles.text}>
          {displayLocation( ) || t( "No-Location" )}
        </Text>
      </Pressable>
      <DatePicker displayDate={displayDate} handleDatePicked={handleDatePicked} />
      <TranslatedText style={textStyles.headerText} text="Identification" />
      {displayIdentification( )}
      <FlatList
        data={Object.keys( iconicTaxaIds )}
        horizontal
        renderItem={renderIconicTaxaButton}
      />
      <TranslatedText style={textStyles.headerText} text="Other-Data" />
      <View style={viewStyles.row}>
        <TranslatedText style={textStyles.text} text="Geoprivacy" />
        <RNPickerSelect
          onValueChange={updateGeoprivacyStatus}
          items={geoprivacyOptions}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          value={currentObs.geoprivacy}
        />

      </View>
      <View style={viewStyles.row}>
        <Text style={textStyles.text}>is the organism wild?</Text>
        <RNPickerSelect
          onValueChange={updateCaptiveStatus}
          items={captiveOptions}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          value={currentObs.captive_flag}
        />
      </View>
      <Notes addNotes={addNotes} />
      <Pressable onPress={searchForProjects}>
        <TranslatedText style={textStyles.text} text="Add-to-projects" />
      </Pressable>
      {!isLoggedIn && <Text style={textStyles.text}>you must be logged in to upload observations</Text>}
      <View style={viewStyles.row}>
        <View style={viewStyles.saveButton}>
          <RoundGreenButton
            buttonText="save"
            testID="ObsEdit.saveButton"
            handlePress={saveObservation}
          />
        </View>
        <RoundGreenButton
          buttonText="UPLOAD-OBSERVATION"
          testID="ObsEdit.uploadButton"
          handlePress={saveAndUploadObservation}
          disabled={!isLoggedIn}
        />
      </View>
    </ScrollNoFooter>
  );
};

export default ObsEdit;
