// @flow

import React, { useState, useCallback } from "react";
import { View, Pressable } from "react-native";
import type { Node } from "react";

import { viewStyles, textStyles } from "../../styles/photoLibrary/photoGalleryHeader";
import TranslatedText from "../SharedComponents/TranslatedText";
import Modal from "../SharedComponents/Modal";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";

type Props = {
  combinePhotos: Function,
  separatePhotos: Function,
  removePhotos: Function,
  navToObsEdit: Function,
  clearSelection: Function,
  selectedObservations: Array<Object>
}

const GroupPhotosFooter = ( {
  combinePhotos,
  separatePhotos,
  removePhotos,
  navToObsEdit,
  clearSelection,
  selectedObservations
}: Props ): Node => {
  const [showModal, setModal] = useState( false );

  const openModal = useCallback( ( ) => setModal( true ), [] );
  const closeModal = useCallback( ( ) => setModal( false ), [] );

  const multipleObsSelected = selectedObservations.length > 1;
  const isSelected = selectedObservations.length > 0;

  const combineStyle = [textStyles.selections, !multipleObsSelected && textStyles.disabled];
  const selectionStyle = [textStyles.selections, !isSelected && textStyles.disabled];

  const selectionModal = ( ) => (
    <View style={viewStyles.selectionModal}>
      <Pressable onPress={combinePhotos} disabled={!multipleObsSelected}>
        <TranslatedText style={combineStyle} text="Combine-Photos" />
      </Pressable>
      <Pressable onPress={separatePhotos} disabled={!isSelected}>
        <TranslatedText style={selectionStyle} text="Separate-Photos" />
      </Pressable>
      <Pressable onPress={removePhotos} disabled={!isSelected}>
        <TranslatedText style={selectionStyle} text="Remove-Photos" />
      </Pressable>
    </View>
  );

  return (
    <View style={viewStyles.footer}>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={selectionModal( )}
      />
      <Pressable onPress={openModal}>
        <TranslatedText text="Select" />
      </Pressable>
      {isSelected && (
        <Pressable
          onPress={clearSelection}
        >
          <TranslatedText style={textStyles.header} text="Cancel" />
        </Pressable>
      )}
      <View style={viewStyles.nextButton}>
        <RoundGreenButton
          buttonText="Next"
          handlePress={navToObsEdit}
          testID="GroupPhotos.next"
        />
      </View>
    </View>
  );
};

export default GroupPhotosFooter;
