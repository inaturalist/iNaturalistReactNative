// @flow

import React, { useState, useContext } from "react";
import { Text, Pressable, View, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { HeaderBackButton } from "@react-navigation/elements";
import { Headline } from "react-native-paper";

import ScrollNoFooter from "../SharedComponents/ScrollNoFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import { textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import LocationPicker from "./LocationPicker";
import { ObsEditContext } from "../../providers/contexts";
import EvidenceList from "./EvidenceList";
import { useLoggedIn } from "../../sharedHooks/useLoggedIn";
import DatePicker from "./DatePicker";
import { createObservedOnStringForUpload } from "../../sharedHelpers/dateAndTime";
import IdentificationSection from "./IdentificationSection";
import OtherDataSection from "./OtherDataSection";
// import BottomModal from "./BottomModal";
// import uploadObservation from "./helpers/uploadObservation";

const ObsEdit = ( ): Node => {
  const {
    currentObsIndex,
    setCurrentObsIndex,
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

  const showNextObservation = ( ) => setCurrentObsIndex( currentObsIndex + 1 );
  const showPrevObservation = ( ) => setCurrentObsIndex( currentObsIndex - 1 );

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
          ? <Headline>{t( "New-Observation" )}</Headline> : (
            <View style={viewStyles.row}>
              {currentObsIndex !== 0 && (
                <Pressable
                  onPress={showPrevObservation}
                >
                  <Text>previous obs</Text>
                </Pressable>
              )}
              <Text>{`${currentObsIndex + 1} of ${observations.length}`}</Text>
              {( currentObsIndex !== observations.length - 1 ) && (
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

  const currentObs = observations[currentObsIndex];
  const latitude = currentObs && currentObs.latitude;
  const longitude = currentObs && currentObs.longitude;

  const openLocationPicker = ( ) => setShowLocationPicker( true );
  const closeLocationPicker = ( ) => setShowLocationPicker( false );

  const updateLocation = newLocation => {
    const updatedObs = observations.map( ( obs, index ) => {
      if ( index === currentObsIndex ) {
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
      <Headline style={textStyles.headerText}>{t( "Evidence" )}</Headline>
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
      <Headline style={textStyles.headerText}>{t( "Identification" )}</Headline>
      <IdentificationSection />
      <Headline style={textStyles.headerText}>{t( "Other-Data" )}</Headline>
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
