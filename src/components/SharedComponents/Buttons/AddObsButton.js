// @flow

import AddObsModal from "components/AddObsModal";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import Modal from "components/SharedComponents/Modal";
import { t } from "i18next";
import * as React from "react";
import { Pressable, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import colors from "styles/tailwindColors";

const shadow = StyleSheet.create( {
  shadowColor: colors.darkGray,
  shadowOffset: {
    width: 0,
    height: 2
  },
  // $FlowIssue[incompatible-shape]
  shadowOpacity: 0.25,
  // $FlowIssue[incompatible-shape]
  shadowRadius: 2,
  // $FlowIssue[incompatible-shape]
  elevation: 5
} );

const AddObsButton = (): React.Node => {
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( () => setModal( true ), [] );
  const closeModal = React.useCallback( () => setModal( false ), [] );

  return (
    <>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={<AddObsModal closeModal={closeModal} />}
      />
      <Pressable
        onPress={openModal}
        testID="add-obs-button"
        disabled={false}
        accessibilityLabel={t( "Observe" )}
        accessibilityHint={t( "Opens-add-observation-modal" )}
        style={shadow}
      >
        <View className="w-[69px] h-[69px] rounded-full overflow-hidden">
          <LinearGradient
            colors={[colors.inatGreen, "#297F87"]}
            angle={156.95}
            useAngle
          >
            <View className="grow aspect-square flex items-center justify-center">
              <INatIcon name="plus-sign" size={69} color={colors.white} />
            </View>
          </LinearGradient>
        </View>
      </Pressable>
    </>
  );
};

export default AddObsButton;
