// @flow

import { useIsFocused } from "@react-navigation/native";
import { ViewWrapper } from "components/SharedComponents";
import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  checkLocationPermission,
  shouldFetchObservationLocation
} from "sharedHelpers/shouldFetchObservationLocation.ts";
import { useCurrentUser } from "sharedHooks";
import useWatchPosition from "sharedHooks/useWatchPosition.ts";
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
  const [locationPermissionNeeded, setLocationPermissionNeeded] = useState( false );

  const {
    isFetchingLocation,
    userLocation
  } = useWatchPosition( {
    shouldFetchLocation
  } );

  useEffect( ( ) => {
    const hasLocation = currentObservation?.latitude && currentObservation?.longitude;
    const checkNeedsLocation = async ( ) => {
      const permission = await checkLocationPermission( );
      if ( permission !== "granted" ) {
        setLocationPermissionNeeded( true );
      }
      const needsLocation = await shouldFetchObservationLocation( currentObservation );
      if ( needsLocation ) {
        setShouldFetchLocation( true );
      }
    };
    if ( !hasLocation ) {
      checkNeedsLocation( );
    }
  }, [currentObservation] );

  useEffect( ( ) => {
    if ( userLocation ) {
      updateObservationKeys( userLocation );
      setShouldFetchLocation( false );
    }
  }, [userLocation, updateObservationKeys] );

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
      <LocationPermissionGate
        permissionNeeded={locationPermissionNeeded}
        onPermissionGranted={( ) => setShouldFetchLocation( true )}
        onPermissionDenied={( ) => setShouldFetchLocation( false )}
        onPermissionBlocked={( ) => setShouldFetchLocation( false )}
        withoutNavigation
      />
    </>
  );
};

export default ObsEdit;
