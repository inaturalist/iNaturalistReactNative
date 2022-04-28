// @flow

import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { viewStyles } from "../../styles/sharedComponents/footer";
// import CameraOptionsModal from "../Camera/CameraOptionsModal";
// import Modal from "./Modal";
import CameraOptionsButton from "./Buttons/CameraOptionsButton";

const Footer = ( ): React.Node => {
  // const [showModal, setModal] = React.useState( false );

  // const openModal = React.useCallback( ( ) => setModal( true ), [] );
  // const closeModal = React.useCallback( ( ) => setModal( false ), [] );

  const navigation = useNavigation( );
  const toggleSideMenu = ( ) => navigation.openDrawer( );
  const navToObsList = ( ) => navigation.navigate( "my observations" );
  // const navToCameraOptions = ( ) => openModal( );
  const navToExplore = ( ) => navigation.navigate( "explore stack" );
  const navToNotifications = ( ) => navigation.navigate( "notifications" );

  return (
    <>
      {/* <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={<CameraOptionsModal closeModal={closeModal} />}
      /> */}
      <View style={[viewStyles.row, viewStyles.shadow]}>
        <Pressable onPress={toggleSideMenu} accessibilityRole="link">
          <Icon name="menu" size={30} />
        </Pressable>
        <Pressable  onPress={navToExplore} accessibilityRole="link">
          <Icon name="web" size={30} />
        </Pressable>
        <CameraOptionsButton buttonType="footer" />
        {/* <Pressable onPress={navToCameraOptions} accessibilityRole="link">
          <Text>camera</Text>
        </Pressable> */}
        <Pressable onPress={navToObsList} accessibilityRole="link">
          <Icon name="account" size={30} />
        </Pressable>
        <Pressable onPress={navToNotifications} accessibilityRole="link">
          <Icon name="bell" size={30} />
        </Pressable>
      </View>
    </>
  );
};

export default Footer;
