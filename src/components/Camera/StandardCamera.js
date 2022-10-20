// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { Pressable, Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import { Avatar, Snackbar, useTheme } from "react-native-paper";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import colors from "styles/colors";

import Photo from "../../models/Photo";
import CameraView from "./CameraView";
import FadeInOutView from "./FadeInOutView";
import PhotoPreview from "./PhotoPreview";

const { useRealm } = RealmContext;

export const MAX_PHOTOS_ALLOWED = 20;

const StandardCamera = ( ): Node => {
  const { colors: themeColors } = useTheme( );
  const { addPhotos } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const photos = params?.photos;
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const [cameraPosition, setCameraPosition] = useState( "back" );
  const devices = useCameraDevices( "wide-angle-camera" );
  const device = devices[cameraPosition];
  const [takePhotoOptions, setTakePhotoOptions] = useState( {
    flash: "off"
  } );
  const [photoUris, setPhotoUris] = useState( [] );
  const [savingPhoto, setSavingPhoto] = useState( false );
  const disallowAddingPhotos = photoUris.length >= MAX_PHOTOS_ALLOWED;
  const [showAlert, setShowAlert] = useState( false );

  const realm = useRealm( );

  const takePhoto = async ( ) => {
    setSavingPhoto( true );
    try {
      if ( disallowAddingPhotos ) {
        setShowAlert( true );
        setSavingPhoto( false );
        return;
      }
      const cameraPhoto = await camera.current.takePhoto( takePhotoOptions );
      const uri = await Photo.savePhoto( realm, cameraPhoto );

      setPhotoUris( photoUris.concat( [uri] ) );
      setSavingPhoto( false );
    } catch ( e ) {
      console.log( e, "couldn't take photo" );
      setSavingPhoto( false );
    }
  };

  const toggleFlash = ( ) => {
    setTakePhotoOptions( {
      ...takePhotoOptions,
      flash: takePhotoOptions.flash === "on" ? "off" : "on"
    } );
  };

  const flipCamera = ( ) => {
    const newPosition = cameraPosition === "back" ? "front" : "back";
    setCameraPosition( newPosition );
  };

  const navToObsEdit = ( ) => {
    addPhotos( photoUris );
    navigation.navigate(
      "ObsEdit",
      { lastScreen: photos && photos.length > 0 ? null : "StandardCamera" }
    );
  };

  useEffect( ( ) => {
    if ( photos?.length > 0 ) {
      setPhotoUris( photos );
    }
  }, [photos] );

  const renderCameraButton = ( icon, disabled ) => (
    <Avatar.Icon
      size={40}
      icon={icon}
      style={{ backgroundColor: disabled ? colors.gray : themeColors.background }}
    />
  );

  return (
    <View className="flex-1 bg-black">
      {device && <CameraView device={device} camera={camera} />}
      <PhotoPreview photoUris={photoUris} setPhotoUris={setPhotoUris} savingPhoto={savingPhoto} />
      <FadeInOutView savingPhoto={savingPhoto} />
      <View className="absolute bottom-0">
        <View className="flex-row justify-between w-screen mb-4 px-4">
          <Pressable onPress={toggleFlash}>
            {renderCameraButton( "flash" )}
          </Pressable>
          <Pressable onPress={flipCamera}>
            {renderCameraButton( "camera-flip" )}
          </Pressable>
        </View>
        <View className="bg-black w-screen h-32 flex-row justify-between items-center px-4">
          <View className="w-1/3" />
          <Pressable onPress={takePhoto}>
            {renderCameraButton( "circle-outline", disallowAddingPhotos )}
          </Pressable>
          <Text className="text-white text-xl w-1/3 text-center" onPress={navToObsEdit}>
            {t( "Next" )}
          </Text>
        </View>
      </View>
      <Snackbar
        visible={showAlert}
        onDismiss={( ) => setShowAlert( false )}
      >
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
    </View>
  );
};

export default StandardCamera;
