// @flow

import React, { useContext } from "react";
import { Text, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import type { Node } from "react";
import { useTranslation } from "react-i18next";

import { pickerSelectStyles, textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import { ObsEditContext } from "../../providers/contexts";
import TranslatedText from "../SharedComponents/TranslatedText";
import Notes from "./Notes";


const OtherDataSection = ( ): Node => {
  const {
    currentObsIndex,
    observations,
    updateObservationKey
  } = useContext( ObsEditContext );
  const { t } = useTranslation( );

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

  const currentObs = observations[currentObsIndex];

  const addNotes = text => updateObservationKey( "description", text );
  const updateGeoprivacyStatus = value => updateObservationKey( "geoprivacy", value );
  const updateCaptiveStatus = value => updateObservationKey( "captive_flag", value );

  // const updateProjectIds = projectId => {
  //   const updatedObs = observations.map( ( obs, index ) => {
  //     if ( index === currentObsIndex ) {
  //       return {
  //         ...obs,
  //         project_ids: obs.project_ids.concat( [projectId] )
  //       };
  //     } else {
  //       return obs;
  //     }
  //   } );
  //   setObservations( updatedObs );
  // };

  return (
    <>
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
        <Text style={textStyles.text}>{t( "Organism-is-wild" )}</Text>
        <RNPickerSelect
          onValueChange={updateCaptiveStatus}
          items={captiveOptions}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          value={currentObs.captive_flag}
        />
      </View>
      <Notes addNotes={addNotes} description={currentObs.description} />
    </>
  );
};

export default OtherDataSection;
