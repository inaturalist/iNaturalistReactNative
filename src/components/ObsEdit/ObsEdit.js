// @flow

import React, { useState, useContext } from "react";
import { Text, Pressable, View, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { HeaderBackButton } from "@react-navigation/elements";

import ScrollNoFooter from "../SharedComponents/ScrollNoFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import { textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import LocationPicker from "./LocationPicker";
import { ObsEditContext } from "../../providers/contexts";
import EvidenceList from "./EvidenceList";
import { useLoggedIn } from "../../sharedHooks/useLoggedIn";
import DatePicker from "./DatePicker";
import { createObservedOnStringForUpload } from "../../sharedHelpers/dateAndTime";
import TranslatedHeadline from "../SharedComponents/Typography/TranslatedHeadline";
import IdentificationSection from "./IdentificationSection";
import OtherDataSection from "./OtherDataSection";
// import BottomModal from "./BottomModal";
// import uploadObservation from "./helpers/uploadObservation";

const ObsEdit = ( ): Node => {
  const {
    currentObsNumber,
    setCurrentObsNumber,
    observations,
    setObservations,
    updateObservationKey,
    saveObservation,
    saveAndUploadObservation
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  // const [showBottomModal, setBottomModal] = useState( false );
  const isLoggedIn = useLoggedIn( );

  // const openBottomModal = useCallback( ( ) => setBottomModal( true ), [] );
  // const closeBottomModal = useCallback( ( ) => setBottomModal( false ), [] );

  const [showLocationPicker, setShowLocationPicker] = useState( false );

  const formatDecimal = coordinate => coordinate && coordinate.toFixed( 6 );

  const updateObservedOn = value => updateObservationKey( "observed_on_string", value );

  const showNextObservation = ( ) => setCurrentObsNumber( currentObsNumber + 1 );
  const showPrevObservation = ( ) => setCurrentObsNumber( currentObsNumber - 1 );

  const renderArrowNavigation = ( ) => {
    if ( observations.length === 0 ) { return; }

    const handleBackButtonPress = ( ) => {
      // openBottomModal( );
      // show modal to dissuade user from going back
      navigation.goBack( );
    };

    return (
      <View style={viewStyles.row}>
        <HeaderBackButton onPress={handleBackButtonPress} />
        {observations.length === 1
          ? <TranslatedHeadline text="New-Observation" /> : (
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

  console.log( currentObs.geoprivacy, "current obs" );

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
      const dateString = createObservedOnStringForUpload( selectedDate );
      updateObservedOn( dateString );
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

  return (
    <ScrollNoFooter>
      {/* <CustomModal
        showModal={showBottomModal}
        closeModal={closeBottomModal}
        modal={(
          <BottomModal />
        )}
        style={viewStyles.noMargin}
      /> */}
      {renderLocationPickerModal( )}
      {renderArrowNavigation( )}
      <TranslatedHeadline style={textStyles.headerText} text="Evidence" />
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
      <DatePicker currentObs={currentObs} handleDatePicked={handleDatePicked} />
      <TranslatedHeadline style={textStyles.headerText} text="Identification" />
      <IdentificationSection />
      <TranslatedHeadline style={textStyles.headerText} text="Other-Data" />
      <OtherDataSection />
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
