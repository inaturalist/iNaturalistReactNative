// @flow

import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { IconButton } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";

import Notes from "./Notes";

type Props = {
  scrollToInput: Function
}

const OtherDataSection = ( { scrollToInput }: Props ): Node => {
  const {
    currentObservation,
    updateObservationKey
  } = useContext( ObsEditContext );

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
    label: t( "No" ),
    value: true
  },
  {
    label: t( "Yes" ),
    value: false
  }];

  const addNotes = text => updateObservationKey( "description", text );
  const updateGeoprivacyStatus = value => updateObservationKey( "geoprivacy", value );
  const updateCaptiveStatus = value => updateObservationKey( "captive_flag", value );

  const currentGeoprivacyStatus = geoprivacyOptions
    .find( e => e.value === currentObservation.geoprivacy );
  const currentCaptiveStatus = captiveOptions
    .find( e => e.value === currentObservation.captive_flag );

  return (
    <>
      <RNPickerSelect
        onValueChange={updateGeoprivacyStatus}
        items={geoprivacyOptions}
        useNativeAndroidPickerStyle={false}
        value={currentObservation.geoprivacy}
      >
        <View className="flex-row ml-3 flex-nowrap items-center">
          <IconButton
            icon="pencil"
            size={14}
          />
          <Text>
            {t( "Geoprivacy" )}
            {" "}
            {currentGeoprivacyStatus?.label}
          </Text>
        </View>
      </RNPickerSelect>
      <RNPickerSelect
        onValueChange={updateCaptiveStatus}
        items={captiveOptions}
        useNativeAndroidPickerStyle={false}
        value={currentObservation.captive_flag}
      >
        <View className="flex-row ml-3 flex-nowrap items-center">
          <IconButton
            icon="pencil"
            size={14}
          />
          <Text>
            {t( "Organism-is-wild" )}
            {" "}
            {currentCaptiveStatus?.label}
          </Text>
        </View>
      </RNPickerSelect>
      <Notes
        addNotes={addNotes}
        description={currentObservation.description}
        scrollToInput={scrollToInput}
      />
    </>
  );
};

export default OtherDataSection;
