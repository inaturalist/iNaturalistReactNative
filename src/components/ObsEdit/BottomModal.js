// @flow

import React, { useContext } from "react";
import { Text, View } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import { viewStyles } from "../../styles/obsEdit/obsEdit";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import { ObsEditContext } from "../../providers/contexts";

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
      <Text>cancel creating observations?</Text>
      <Text>by exiting...</Text>
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
