// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { t } from "i18next";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import { Pressable, Text, View } from "react-native";
import { Avatar, Snackbar, useTheme } from "react-native-paper";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import Realm from "realm";

import realmConfig from "../../models/index";
import Photo from "../../models/Photo";
import { ObsEditContext } from "../../providers/contexts";
import { viewStyles } from "../../styles/camera/standardCamera";
import colors from "../../styles/colors";
import { textStyles } from "../../styles/obsDetails/obsDetails";
import CameraView from "./CameraView";
import FadeInOutView from "./FadeInOutView";
import PhotoPreview from "./PhotoPreview";

export const MAX_PHOTOS_ALLOWED = 20;

const StandardCamera = ( ): Node => {
  const { colors: themeColors } = useTheme( );
  // TODO: figure out if there's a way to write location to photo metadata with RN
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

  const takePhoto = async ( ) => {
    setSavingPhoto( true );
    try {
      if ( disallowAddingPhotos ) {
        setShowAlert( true );
        setSavingPhoto( false );
        return;
      }
      const cameraPhoto = await camera.current.takePhoto( takePhotoOptions );
      const realm = await Realm.open( realmConfig );
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
    <View style={viewStyles.container}>
      {device && <CameraView device={device} camera={camera} />}
      <PhotoPreview photoUris={photoUris} setPhotoUris={setPhotoUris} savingPhoto={savingPhoto} />
      <FadeInOutView savingPhoto={savingPhoto} />
      <View style={viewStyles.bottomButtons}>
        <View style={viewStyles.cameraSettingsRow}>
          <Pressable
            style={viewStyles.flashButton}
            onPress={toggleFlash}
          >
            {renderCameraButton( "flash" )}
          </Pressable>
          <Pressable
            style={viewStyles.cameraFlipButton}
            onPress={flipCamera}
          >
            {renderCameraButton( "camera-flip" )}
          </Pressable>
          <View />

        </View>
        <View style={viewStyles.cameraCaptureRow}>
          <Pressable
            style={viewStyles.captureButton}
            onPress={takePhoto}
          >
            {renderCameraButton( "circle-outline", disallowAddingPhotos )}
          </Pressable>
          <Pressable
            style={viewStyles.nextButton}
            onPress={navToObsEdit}
          >
            <Text style={textStyles.whiteText}>{t( "Next" )}</Text>
          </Pressable>
        </View>
      </View>

      <Snackbar
        visible={showAlert}
        onDismiss={() => setShowAlert( false )}
      >
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
    </View>
  );
};

export default StandardCamera;
