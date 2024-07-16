// @flow

import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import shouldFetchObservationLocation from "sharedHelpers/shouldFetchObservationLocation.ts";
import { useCurrentUser, useLocationPermission, useWatchPosition } from "sharedHooks";
import useStore from "stores/useStore";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

import BottomButtons from "./BottomButtons";
import EvidenceSectionContainer from "./EvidenceSectionContainer";
import Header from "./Header";
import IdentificationSection from "./IdentificationSection";
import MultipleObservationsArrows from "./MultipleObservationsArrows";
import OtherDataSection from "./OtherDataSection";

const DROP_SHADOW = getShadowForColor( colors.black, {
  offsetHeight: -2
} );

const ObsEdit = ( ): Node => {
  const navigation = useNavigation( );
  const currentObservation = useStore( state => state.currentObservation );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const observations = useStore( state => state.observations );
  const setCurrentObservationIndex = useStore( state => state.setCurrentObservationIndex );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const [passesEvidenceTest, setPassesEvidenceTest] = useState( false );
  const [passesIdentificationTest, setPassesIdentificationTest] = useState( false );
  const [resetScreen, setResetScreen] = useState( false );
  const isFocused = useIsFocused( );
  const currentUser = useCurrentUser( );
  const [shouldFetchLocation, setShouldFetchLocation] = useState( false );
  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission( );

  const {
    isFetchingLocation,
    userLocation
  } = useWatchPosition( {
    shouldFetchLocation
  } );

  useEffect( ( ) => {
    if ( shouldFetchObservationLocation( currentObservation ) ) {
      setShouldFetchLocation( true );
    }
  }, [currentObservation] );

  useEffect( ( ) => {
    if ( userLocation?.latitude ) {
      updateObservationKeys( userLocation );
    }
  }, [userLocation, updateObservationKeys] );

  useEffect( ( ) => {
    // this is needed to make sure watchPosition is called when a user
    // navigates to ObsEdit a second time during an app session,
    // otherwise, state will indicate that fetching is not needed
    const unsubscribe = navigation.addListener( "blur", ( ) => {
      setShouldFetchLocation( false );
    } );
    return unsubscribe;
  }, [navigation] );

  const navToLocationPicker = useCallback( ( ) => {
    navigation.navigate( "LocationPicker", { goBackOnSave: true } );
  }, [navigation] );

  const onLocationPress = ( ) => {
    // If we have location permissions, navigate to the location picker
    if ( hasPermissions ) {
      navToLocationPicker();
    } else {
      // If we don't have location permissions, request them
      requestPermissions( );
    }
  };

  if ( !isFocused ) return null;

  // This should never, ever happen
  if ( currentObservation?.user && currentUser && currentUser.id !== currentObservation.user.id ) {
    throw new Error( "User tried to edit observation they do not own" );
  }

  return (
    <>
      <ViewWrapper testID="obs-edit">
        <Header
          currentObservation={currentObservation}
          observations={observations}
        />
        <KeyboardAwareScrollView>
          {currentObservation && (
            <View
              className="bg-white rounded-t-3xl mt-1"
              style={( observations.length > 1 )
                ? DROP_SHADOW
                : undefined}
            >
              <View className="h-screen">
                {observations.length > 1 && (
                  <MultipleObservationsArrows
                    currentObservationIndex={currentObservationIndex}
                    observations={observations}
                    setCurrentObservationIndex={setCurrentObservationIndex}
                    setResetScreen={setResetScreen}
                  />
                )}
                <EvidenceSectionContainer
                  currentObservation={currentObservation}
                  isFetchingLocation={isFetchingLocation}
                  onLocationPress={onLocationPress}
                  passesEvidenceTest={passesEvidenceTest}
                  setPassesEvidenceTest={setPassesEvidenceTest}
                  updateObservationKeys={updateObservationKeys}
                />
                <IdentificationSection
                  currentObservation={currentObservation}
                  passesIdentificationTest={passesIdentificationTest}
                  resetScreen={resetScreen}
                  setPassesIdentificationTest={setPassesIdentificationTest}
                  setResetScreen={setResetScreen}
                  updateObservationKeys={updateObservationKeys}
                />
                <OtherDataSection
                  currentObservation={currentObservation}
                  updateObservationKeys={updateObservationKeys}
                />
              </View>
            </View>
          )}
        </KeyboardAwareScrollView>
      </ViewWrapper>
      <BottomButtons
        currentObservation={currentObservation}
        currentObservationIndex={currentObservationIndex}
        observations={observations}
        passesEvidenceTest={passesEvidenceTest}
        passesIdentificationTest={passesIdentificationTest}
        setCurrentObservationIndex={setCurrentObservationIndex}
      />
      {renderPermissionsGate( {
        // If the user does not give location permissions in any form,
        // navigate to the location picker (if granted we just continue fetching the location)
        onRequestDenied: navToLocationPicker,
        onRequestBlocked: navToLocationPicker,
        onModalHide: ( ) => {
          if ( !hasPermissions ) navToLocationPicker();
        }
      } )}
    </>
  );
};

export default ObsEdit;
