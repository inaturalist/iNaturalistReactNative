// @flow

import AddObsModal from "components/AddObsModal";
import { INatIcon, Modal } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import LinearGradient from "react-native-linear-gradient";
import { dropShadow } from "styles/global";
import colors from "styles/tailwindColors";

const AddObsButton = (): React.Node => {
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( () => setModal( true ), [] );
  const closeModal = React.useCallback( () => setModal( false ), [] );

  const addObsModal = <AddObsModal closeModal={closeModal} />;

  return (
    <>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={addObsModal}
      />
      <Pressable
        className="w-[69px] h-[69px] rounded-full overflow-hidden"
        style={dropShadow}
        onPress={openModal}
        testID="add-obs-button"
        disabled={false}
        accessibilityLabel={t( "Add-observations" )}
        accessibilityHint={t( "Opens-add-observation-modal" )}
        accessibilityRole="button"
        accessibilityState={{
          disabled: false
        }}
      >
        <LinearGradient
          colors={[colors.inatGreen, "#297F87"]}
          angle={156.95}
          useAngle
        >
          <View className="grow aspect-square flex items-center justify-center">
            <INatIcon name="plus" size={31} color={colors.white} />
          </View>
        </LinearGradient>
      </Pressable>
    </>
  );
};

export default AddObsButton;
