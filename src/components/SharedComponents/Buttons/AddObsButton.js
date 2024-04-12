// @flow

import { useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal";
import { INatIcon, Modal } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import { getCurrentRoute } from "navigation/navigationUtils";
import * as React from "react";
import LinearGradient from "react-native-linear-gradient";
import useStore from "stores/useStore";
import { dropShadow } from "styles/global";
import colors from "styles/tailwindColors";

export const GradientButton = ( {
  onPress,
  accessibilityHint,
  iconName,
  iconSize
}: {
  onPress: Function,
  accessibilityHint: string,
  iconName: string,
  iconSize: number
} ): React.Node => (
  <Pressable
    className="w-[69px] h-[69px] rounded-full overflow-hidden"
    testID="add-obs-button"
    style={dropShadow}
    onPress={onPress}
    disabled={false}
    accessibilityLabel={t( "Add-observations" )}
    accessibilityHint={accessibilityHint || t( "Opens-ar-camera" )}
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
        <INatIcon
          name={iconName || "arcamera"}
          size={iconSize || 37}
          color={colors.white}
        />
      </View>
    </LinearGradient>
  </Pressable>
);

const AddObsButton = (): React.Node => {
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( () => setModal( true ), [] );
  const closeModal = React.useCallback( () => setModal( false ), [] );

  const resetStore = useStore( state => state.resetStore );
  const isAdvancedUser = useStore( state => state.isAdvancedUser );
  const navigation = useNavigation( );
  const navAndCloseModal = ( screen, params ) => {
    const currentRoute = getCurrentRoute();
    if ( screen !== "ObsEdit" ) {
      resetStore( );
    }
    // access nested screen
    navigation.navigate( "CameraNavigator", {
      screen,
      params: { ...params, previousScreen: currentRoute }
    } );
    closeModal( );
  };
  const navToARCamera = ( ) => { navAndCloseModal( "Camera", { camera: "AR" } ); };

  const addObsModal = <AddObsModal closeModal={closeModal} navAndCloseModal={navAndCloseModal} />;

  return (
    <>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={addObsModal}
      />
      <GradientButton
        onPress={isAdvancedUser
          ? openModal
          : navToARCamera}
        accessibilityHint={isAdvancedUser && t( "Opens-add-observation-modal" )}
        iconName={isAdvancedUser && "plus"}
        iconSize={isAdvancedUser && 31}
      />
    </>
  );
};

export default AddObsButton;
