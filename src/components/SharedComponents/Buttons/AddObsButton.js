// @flow

import AddObsModal from "components/AddObsModal";
import { INatIcon } from "components/SharedComponents";
import Modal from "components/SharedComponents/Modal";
import { View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import { Pressable } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import getShadowStyle from "sharedHelpers/getShadowStyle";
import colors from "styles/tailwindColors";

const shadow = getShadowStyle( {
  shadowColor: colors.black,
  offsetWidth: 0,
  offsetHeight: 2,
  radius: 2,
  opacity: 0.25,
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
        accessibilityRole="button"
        accessibilityState={{
          disabled: false
        }}
        style={shadow}
      >
        <View className="w-[69px] h-[69px] rounded-full overflow-hidden">
          <LinearGradient
            colors={[colors.inatGreen, "#297F87"]}
            angle={156.95}
            useAngle
          >
            <View className="grow aspect-square flex items-center justify-center">
              <INatIcon name="plus-sign" size={31} color={colors.white} />
            </View>
          </LinearGradient>
        </View>
      </Pressable>
    </>
  );
};

export default AddObsButton;
