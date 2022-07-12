// @flow

import React, { useState, useCallback } from "react";
import { View, Pressable, Text } from "react-native";
import type { Node } from "react";
import { t } from "i18next";
import { Button, Menu } from "react-native-paper";

import { viewStyles, textStyles } from "../../styles/photoLibrary/photoGalleryFooter";
import { colors } from "../../styles/global";
import Modal from "../SharedComponents/Modal";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import SecondaryCTAButton from "../SharedComponents/Buttons/SecondaryCTAButton";

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
  const [showModal, setModal] = useState( false );

  const openModal = useCallback( ( ) => setModal( true ), [] );
  const closeModal = useCallback( ( ) => setModal( false ), [] );

  const noObsSelected = selectedObservations.length === 0;
  const oneObsSelected = selectedObservations.length === 1;
  const obsWithMultiplePhotosSelected = selectedObservations?.[0]?.photos?.length > 1;

  const selectionModal = ( ) => (
    <View style={viewStyles.selectionModal}>
      <SecondaryCTAButton onPress={combinePhotos} disabled={noObsSelected || oneObsSelected}>
        <Text>{t( "Combine-Photos" )}</Text>
      </SecondaryCTAButton>
      <SecondaryCTAButton onPress={separatePhotos} disabled={!obsWithMultiplePhotosSelected}>
        <Text>{t( "Separate-Photos" )}</Text>
      </SecondaryCTAButton>
      <SecondaryCTAButton onPress={removePhotos} disabled={noObsSelected}>
        <Text>{t( "Remove-Photos" )}</Text>
      </SecondaryCTAButton>
    </View>
  );

  const renderSelectionModeFooter = ( ) => (
    <>
      <View style={viewStyles.selectionButtons}>
        <Button onPress={openModal} icon="dots-horizontal" textColor={colors.logInGray} />
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
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={selectionModal( )}
        backdropOpacity={0}
      />
      {selectionMode ? renderSelectionModeFooter( ) : renderFooter( )}
    </View>
  );
};

export default GroupPhotosFooter;
