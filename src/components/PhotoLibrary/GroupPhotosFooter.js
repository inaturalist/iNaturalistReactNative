// @flow

import React from "react";
import { View, Text } from "react-native";
import type { Node } from "react";
import { t } from "i18next";
import { Menu } from "react-native-paper";

import { viewStyles } from "../../styles/photoLibrary/photoGalleryFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import SecondaryCTAButton from "../SharedComponents/Buttons/SecondaryCTAButton";
import KebabMenu from "../SharedComponents/KebabMenu";

type Props = {
  combinePhotos: Function,
  separatePhotos: Function,
  removePhotos: Function,
  navToObsEdit: Function,
  clearSelection: Function,
  selectedObservations: Array<Object>,
  setSelectionMode: Function,
  selectionMode: boolean
}

const GroupPhotosFooter = ( {
  combinePhotos,
  separatePhotos,
  removePhotos,
  navToObsEdit,
  clearSelection,
  selectedObservations,
  setSelectionMode,
  selectionMode
}: Props ): Node => {
  const noObsSelected = selectedObservations.length === 0;
  const oneObsSelected = selectedObservations.length === 1;
  const obsWithMultiplePhotosSelected = selectedObservations?.[0]?.photos?.length > 1;

  const renderSelectionModeFooter = ( ) => (
    <>
      <View style={viewStyles.selectionButtons}>
        <KebabMenu>
          <Menu.Item
            onPress={combinePhotos}
            disabled={noObsSelected || oneObsSelected}
            title={t( "Combine-Photos" )}
          />
          <Menu.Item
            onPress={separatePhotos}
            disabled={!obsWithMultiplePhotosSelected}
            title={t( "Separate-Photos" )}
          />
          <Menu.Item
            onPress={removePhotos}
            disabled={noObsSelected}
            title={t( "Remove-Photos" )}
          />
        </KebabMenu>
        <SecondaryCTAButton
          onPress={( ) => {
            setSelectionMode( false );
            clearSelection( );
          }}
        >
          <Text>{t( "Cancel" )}</Text>
        </SecondaryCTAButton>
      </View>
      <View style={viewStyles.nextButton} />
    </>
  );

  const renderFooter = ( ) => (
    <>
      <View style={viewStyles.selectionButtons}>
        <SecondaryCTAButton
          onPress={( ) => setSelectionMode( true )}
        >
          <Text>{t( "Select" )}</Text>
        </SecondaryCTAButton>
      </View>
      <View style={viewStyles.nextButton}>
        <RoundGreenButton
          buttonText="Next"
          handlePress={navToObsEdit}
          testID="GroupPhotos.next"
        />
      </View>
    </>
  );

  return (
    <View style={viewStyles.footer}>
      {selectionMode ? renderSelectionModeFooter( ) : renderFooter( )}
    </View>
  );
};

export default GroupPhotosFooter;
