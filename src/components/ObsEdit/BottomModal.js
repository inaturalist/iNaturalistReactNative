// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React, { useContext } from "react";
import { View } from "react-native";

import { ObsEditContext } from "../../providers/contexts";
import { viewStyles } from "../../styles/obsEdit/obsEdit";
import PlaceholderText from "../PlaceholderText";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";

const BottomModal = ( ): Node => {
  const navigation = useNavigation( );
  const {
    observations,
    setObservations
  } = useContext( ObsEditContext );

  const deleteObsAndNavigate = ( ) => {
    setObservations( [] );
    navigation.goBack( );
  };

  const saveObsAndNavigate = ( ) => {
    console.log( "save to realm for later upload" );
    setObservations( [] );
    navigation.goBack( );
  };

  return (
    <View style={viewStyles.bottomModal}>
      <PlaceholderText text="cancel creating observations?" />
      <View style={viewStyles.row}>
        <View style={viewStyles.saveButton}>
          <RoundGreenButton
            buttonText="save"
            testID="ObsEdit.saveButton"
            handlePress={saveObsAndNavigate}
          />
        </View>
        <RoundGreenButton
          buttonText="DELETE-X-OBSERVATIONS"
          count={observations.length}
          handlePress={deleteObsAndNavigate}
          testID="ObsEdit.exitNavigation"
        />
      </View>
    </View>
  );
};

export default BottomModal;
