// @flow

import { useNavigation } from "@react-navigation/native";
import {
  BottomSheet, BottomSheetStandardBackdrop, Button,
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";

type Props = {
  handleClose: Function
}

const DiscardChangesSheet = ( {
  handleClose
}: Props ): Node => {
  const {
    observations,
    saveAllObservations,
    setObservations
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );

  const multipleObservations = observations.length > 1;

  const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      handleClose={handleClose}
      headerText={multipleObservations
        ? t( "DISCARD-X-OBSERVATIONS", { count: observations.length } )
        : t( "DISCARD-OBSERVATION" )}
      snapPoints={[178]}
    >
      <View className="items-center p-5">
        <List2 className="mb-3">
          {
            multipleObservations
              ? t( "By-exiting-your-observations-not-saved" )
              : t( "By-exiting-changes-not-saved" )
          }
        </List2>
        <View className="flex-row">
          {multipleObservations && (
            <Button
              onPress={( ) => {
                saveAllObservations( );
                setObservations( [] );
                navigation.navigate( "ObsList" );
              }}
              text={t( "SAVE-ALL" )}
            />
          ) }
          <Button
            onPress={handleClose}
            text={multipleObservations
              ? t( "DISCARD-ALL" )
              : t( "DISCARD-OBSERVATION" )}
            level="warning"
            className="grow ml-3"
          />
        </View>
      </View>
    </BottomSheet>
  );
};

export default DiscardChangesSheet;
