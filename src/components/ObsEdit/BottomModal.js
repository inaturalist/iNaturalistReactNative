// @flow

import { useNavigation } from "@react-navigation/native";
import PlaceholderText from "components/PlaceholderText";
import Button from "components/SharedComponents/Buttons/Button";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { View } from "react-native";
import { viewStyles } from "styles/obsEdit/obsEdit";

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
          <Button
            level="primary"
            text="save"
            testID="ObsEdit.saveButton"
            onPress={saveObsAndNavigate}
          />
        </View>
        <Button
          level="primary"
          text="DELETE-X-OBSERVATIONS"
          count={observations.length}
          onPress={deleteObsAndNavigate}
          testID="ObsEdit.exitNavigation"
        />
      </View>
    </View>
  );
};

export default BottomModal;
