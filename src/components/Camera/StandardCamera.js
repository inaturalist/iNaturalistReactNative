// @flow

import React, { useRef, useState, useEffect, useContext } from "react";
import { Text, View, Pressable } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";
import { Avatar } from "react-native-paper";

import { viewStyles } from "../../styles/camera/standardCamera";
import { ObsEditContext } from "../../providers/contexts";
import CameraView from "./CameraView";
import PhotoPreview from "./PhotoPreview";
import { textStyles } from "../../styles/obsDetails/obsDetails";

const StandardCamera = ( ): Node => {
  // TODO: figure out if there's a way to write location to photo metadata with RN
  const { addPhotos } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const [cameraPosition, setCameraPosition] = useState( "back" );
  const devices = useCameraDevices( "wide-angle-camera" );
  const device = devices[cameraPosition];
  const [takePhotoOptions, setTakePhotoOptions] = useState( {
    flash: "off"
  } );
  const [photos, setPhotos] = useState( [] );

  useEffect( ( ) => {
    navigation.addListener( "blur", ( ) => {
      if ( photos.length > 0 ) {
        setPhotos( [] );
      }
    } );
  }, [navigation, photos] );

  const takePhoto = async ( ) => {
    try {
      const photo = await camera.current.takePhoto( takePhotoOptions );
      // only 10 photos allowed
      if ( photos.length < 10 ) {
        setPhotos( photos.concat( [photo] ) );
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
    addPhotos( photos );
    navigation.navigate( "ObsEdit" );
  };

  return (
    <View style={viewStyles.container}>
      {device && <CameraView device={device} camera={camera} />}
      <PhotoPreview photos={photos} setPhotos={setPhotos} />
      <View style={viewStyles.row}>
        <Pressable
          style={viewStyles.flashButton}
          onPress={toggleFlash}
        >
          <Avatar.Icon size={40} icon="flash" />
        </Pressable>
        <Pressable
          style={viewStyles.cameraFlipButton}
          onPress={flipCamera}
        >
          <Avatar.Icon size={40} icon="camera-flip" />
        </Pressable>
        <View />

      </View>
      <View style={viewStyles.secondRow}>
        <Pressable
          style={viewStyles.captureButton}
          onPress={takePhoto}
        >
          <Avatar.Icon size={40} icon="circle-outline" />
        </Pressable>
        <Pressable
          style={viewStyles.cameraFlipButton}
          onPress={navToObsEdit}
        >
          <Text style={textStyles.whiteText}>next</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default StandardCamera;
