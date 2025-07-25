// @flow

import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import { Animated } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import shouldFetchObservationLocation, {
  isFromCamera,
  isFromNoEvidence,
  isFromSoundRecorder,
  isNew
} from "sharedHelpers/shouldFetchObservationLocation.ts";
import { useCurrentUser, useLocationPermission, useWatchPosition } from "sharedHooks";
import useStore from "stores/useStore";
import { getShadow } from "styles/global";

import BottomButtonsContainer from "./BottomButtonsContainer";
import EvidenceSectionContainer from "./EvidenceSectionContainer";
import IdentificationSection from "./IdentificationSection";
import MultipleObservationsArrows from "./MultipleObservationsArrows";
import MultipleObservationsUploadStatus from "./MultipleObservationsUploadStatus";
import ObsEditHeader from "./ObsEditHeader";
import OtherDataSection from "./OtherDataSection";

const DROP_SHADOW = getShadow( {
  offsetHeight: -2
} );

const ObsEdit = ( ): Node => {
  const navigation = useNavigation( );
  const currentObservation = useStore( state => state.currentObservation );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const observations = useStore( state => state.observations );
  const setCurrentObservationIndex = useStore( state => state.setCurrentObservationIndex );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const resetUploadObservationsSlice = useStore( state => state.resetUploadObservationsSlice );
  const savedOrUploadedMultiObsFlow = useStore( state => state.savedOrUploadedMultiObsFlow );
  const [passesEvidenceTest, setPassesEvidenceTest] = useState( false );
  const [resetScreen, setResetScreen] = useState( false );
  const isFocused = useIsFocused( );
  const currentUser = useCurrentUser( );
  const {
    hasPermissions: hasLocationPermission,
    hasBlockedPermissions: hasBlockedLocationPermission,
    renderPermissionsGate: renderLocationPermissionGate,
    requestPermissions: requestLocationPermission
  } = useLocationPermission( );

  const fadeAnim = React.useRef( new Animated.Value( 1 ) ).current;

  const fade = () => {
    Animated.timing( fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true
    } ).start( fadeAnim.setValue( 0 ) );
  };

  const animatedStyle = {
    flex: 1,
    opacity: fadeAnim, // Bind opacity to animated value
    ...DROP_SHADOW
  };

  const shouldFetchLocation = hasLocationPermission
    && shouldFetchObservationLocation( currentObservation );

  const {
    isFetchingLocation,
    stopWatch,
    subscriptionId,
    userLocation
  } = useWatchPosition( { shouldFetchLocation } );

  useEffect( ( ) => {
    if ( userLocation?.latitude ) {
      updateObservationKeys( userLocation );
    }
  }, [userLocation, updateObservationKeys] );

  useEffect( ( ) => {
    resetUploadObservationsSlice( );
  }, [resetUploadObservationsSlice] );

  const navToLocationPicker = useCallback( ( ) => {
    stopWatch( subscriptionId );
    navigation.navigate( "LocationPicker" );
  }, [stopWatch, subscriptionId, navigation] );

  const onLocationPress = ( ) => {
    if (
      !hasLocationPermission
      && !hasBlockedLocationPermission
      && isNew( currentObservation )
      && (
        isFromCamera( currentObservation )
        || isFromSoundRecorder( currentObservation )
        || isFromNoEvidence( currentObservation )
      )
    ) {
      requestLocationPermission( );
    } else {
      navToLocationPicker( );
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
        <KeyboardAwareScrollView
          stickyHeaderIndices={[0]}
        >
          <ObsEditHeader
            currentObservation={currentObservation}
            observations={observations}
          />
          {currentObservation && (
            <View
              className="bg-white rounded-t-3xl mt-1 mb-5"
              style={( observations.length > 1 )
                ? DROP_SHADOW
                : undefined}
            >
              {observations.length > 1 && (
                <MultipleObservationsArrows
                  currentObservationIndex={currentObservationIndex}
                  observations={observations}
                  setCurrentObservationIndex={setCurrentObservationIndex}
                  setResetScreen={setResetScreen}
                  transitionAnimation={fade}
                  transitionAnimationRef={fadeAnim}
                />
              )}
              <Animated.View style={animatedStyle}>
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
                  resetScreen={resetScreen}
                  setResetScreen={setResetScreen}
                  updateObservationKeys={updateObservationKeys}
                />
                <OtherDataSection
                  currentObservation={currentObservation}
                  updateObservationKeys={updateObservationKeys}
                />
              </Animated.View>
            </View>
          )}
        </KeyboardAwareScrollView>
      </ViewWrapper>
      {savedOrUploadedMultiObsFlow && <MultipleObservationsUploadStatus />}
      {currentObservation && (
        <BottomButtonsContainer
          currentObservation={currentObservation}
          currentObservationIndex={currentObservationIndex}
          observations={observations}
          passesEvidenceTest={passesEvidenceTest}
          setCurrentObservationIndex={setCurrentObservationIndex}
          transitionAnimation={fade}
        />
      )}
      {renderLocationPermissionGate( {
        // If the user does not give location permissions in any form,
        // navigate to the location picker (if granted we just continue fetching the location)
        onModalHide: ( ) => {
          if ( !hasLocationPermission ) navToLocationPicker();
        }
      } )}
    </>
  );
};

export default ObsEdit;
