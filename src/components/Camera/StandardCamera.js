// @flow

import React, { useRef, useState, useContext, useEffect } from "react";
import { Text, View, Pressable } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import type { Node } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Avatar, useTheme } from "react-native-paper";
import Realm from "realm";
import { t } from "i18next";

import { viewStyles } from "../../styles/camera/standardCamera";
import { ObsEditContext } from "../../providers/contexts";
import CameraView from "./CameraView";
import PhotoPreview from "./PhotoPreview";
import { textStyles } from "../../styles/obsDetails/obsDetails";
import realmConfig from "../../models/index";
import Photo from "../../models/Photo";

const StandardCamera = ( ): Node => {
  const { colors } = useTheme( );
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

  const takePhoto = async ( ) => {
    try {
      const cameraPhoto = await camera.current.takePhoto( takePhotoOptions );
      const realm = await Realm.open( realmConfig );
      const uri = await Photo.savePhoto( realm, cameraPhoto );

      // only 10 photoUris allowed
      if ( photoUris.length < 10 ) {
        setPhotoUris( photoUris.concat( [uri] ) );
      }
    } catch ( e ) {
      console.log( e, "couldn't take photo" );
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
    navigation.navigate( "ObsEdit", { lastScreen: "StandardCamera" } );
  };

  useEffect( ( ) => {
    if ( photos?.length > 0 ) {
      setPhotoUris( photos );
    }
  }, [photos] );

  const renderCameraButton = ( icon ) => <Avatar.Icon size={40} icon={icon} style={{ backgroundColor: colors.background }} />;

  return (
    <View style={viewStyles.container}>
      {device && <CameraView device={device} camera={camera} />}
      <PhotoPreview photoUris={photoUris} setPhotoUris={setPhotoUris} />
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
          {renderCameraButton( "circle-outline" )}
        </Pressable>
        <Pressable
          style={viewStyles.nextButton}
          onPress={navToObsEdit}
        >
          <Text style={textStyles.whiteText}>{t( "Next" )}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default StandardCamera;
