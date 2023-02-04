// @flow

import { Button } from "components/SharedComponents";
import SecondaryCTAButton from "components/SharedComponents/Buttons/SecondaryCTAButton";
import KebabMenu from "components/SharedComponents/KebabMenu";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { Menu } from "react-native-paper";

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
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const noObsSelected = selectedObservations.length === 0;
  const oneObsSelected = selectedObservations.length === 1;
  const obsWithMultiplePhotosSelected = selectedObservations?.[0]?.photos?.length > 1;

  const renderSelectionModeFooter = ( ) => (
    <View className="flex-row">
      <KebabMenu
        visible={kebabMenuVisible}
        setVisible={setKebabMenuVisible}
      >
        <Menu.Item
          onPress={( ) => {
            combinePhotos( );
            setKebabMenuVisible( false );
          }}
          disabled={noObsSelected || oneObsSelected}
          title={t( "Combine-Photos" )}
        />
        <Menu.Item
          onPress={( ) => {
            separatePhotos( );
            setKebabMenuVisible( false );
          }}
          disabled={!obsWithMultiplePhotosSelected}
          title={t( "Separate-Photos" )}
        />
        <Menu.Item
          onPress={( ) => {
            removePhotos( );
            setKebabMenuVisible( false );
          }}
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
  );

  const renderFooter = ( ) => (
    <>
      <SecondaryCTAButton
        onPress={( ) => setSelectionMode( true )}
      >
        <Text>{t( "Select" )}</Text>
      </SecondaryCTAButton>
      <View className="w-28">
        <Button
          level="focus"
          text={t( "Next" )}
          onPress={navToObsEdit}
          testID="GroupPhotos.next"
        />
      </View>
    </>
  );

  return (
    <View className="h-16 flex-row justify-between mx-2">
      {selectionMode ? renderSelectionModeFooter( ) : renderFooter( )}
    </View>
  );
};

export default GroupPhotosFooter;
