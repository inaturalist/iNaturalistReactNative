// @flow

import React, { useState, useCallback, useContext } from "react";
import { Text, Pressable, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import type { Node } from "react";
import { useTranslation } from "react-i18next";

import { pickerSelectStyles, textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import CustomModal from "../SharedComponents/Modal";
import ObsEditSearch from "./ObsEditSearch";
import { ObsEditContext } from "../../providers/contexts";
import TranslatedText from "../SharedComponents/TranslatedText";
import Notes from "./Notes";


const OtherDataSection = ( ): Node => {
  const {
    currentObsNumber,
    observations,
    updateObservationKey,
    setObservations
  } = useContext( ObsEditContext );
  const { t } = useTranslation( );
  const [showModal, setModal] = useState( false );
  const [source, setSource] = useState( null );

  const openModal = useCallback( ( ) => setModal( true ), [] );
  const closeModal = useCallback( ( ) => setModal( false ), [] );

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

  const currentObs = observations[currentObsNumber];

  const addNotes = text => updateObservationKey( "description", text );
  const updateGeoprivacyStatus = value => updateObservationKey( "geoprivacy", value );
  const updateCaptiveStatus = value => updateObservationKey( "captive_flag", value );

  const searchForProjects = ( ) => {
    setSource( "projects" );
    openModal( );
  };

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

  const updateObsAndCloseModal = id => {
    // TODO: need somewhere to display which projects a user has joined
    updateProjectIds( id );
    closeModal( );
  };

  return (
    <>
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
      <Pressable onPress={searchForProjects}>
        <TranslatedText style={textStyles.text} text="Add-to-projects" />
      </Pressable>
      <Notes addNotes={addNotes} />
    </>
  );
};

export default OtherDataSection;
