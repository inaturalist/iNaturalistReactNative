// @flow

import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { viewStyles } from "../../styles/sharedComponents/footer";
import CameraOptionsModal from "../Camera/CameraOptionsModal";
import Modal from "./Modal";

const Footer = ( ): React.Node => {
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( ( ) => setModal( true ), [] );
  const closeModal = React.useCallback( ( ) => setModal( false ), [] );

  const navigation = useNavigation( );
  const toggleSideMenu = ( ) => navigation.openDrawer( );
  const navToObsList = ( ) => navigation.navigate( "my observations" );
  const navToCameraOptions = ( ) => openModal( );
  const navToExplore = ( ) => navigation.navigate( "explore stack" );

  return (
    <>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={<CameraOptionsModal closeModal={closeModal} />}
      />
      <View style={[viewStyles.row, viewStyles.shadow]}>
        <Pressable onPress={toggleSideMenu} accessibilityRole="link">
          <Text>menu</Text>
        </Pressable>
        <Pressable  onPress={navToExplore} accessibilityRole="link">
          <Text>explore</Text>
        </Pressable>
        <Pressable onPress={navToCameraOptions} accessibilityRole="link">
          <Text>camera</Text>
        </Pressable>
        <Pressable onPress={navToObsList} accessibilityRole="link">
          <Text>obs list</Text>
        </Pressable>
        <Pressable accessibilityRole="link">
          <Text>notifications</Text>
        </Pressable>
      </View>
    </>
  );
};

export default Footer;
