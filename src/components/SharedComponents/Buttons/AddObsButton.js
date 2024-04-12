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
    navigation.navigate( "NoBottomTabStackNavigator", {
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
      <Pressable
        className="w-[69px] h-[69px] rounded-full overflow-hidden"
        style={dropShadow}
        onPress={isAdvancedUser
          ? openModal
          : navToARCamera}
        testID="add-obs-button"
        disabled={false}
        accessibilityLabel={t( "Add-observations" )}
        accessibilityHint={isAdvancedUser
          ? t( "Opens-add-observation-modal" )
          : t( "Opens-ar-camera" )}
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
              name={isAdvancedUser
                ? "plus"
                : "arcamera"}
              size={isAdvancedUser
                ? 31
                : 37}
              color={colors.white}
            />
          </View>
        </LinearGradient>
      </Pressable>
    </>
  );
};

export default AddObsButton;
