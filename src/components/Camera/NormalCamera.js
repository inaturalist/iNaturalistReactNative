// @flow

import React, { useRef, useState } from "react";
import { Text, StyleSheet, View, Pressable } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import type { Node } from "react";

import { viewStyles } from "../../styles/camera/normalCamera";

const NormalCamera = ( ): Node => {
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const [cameraPosition, setCameraPosition] = useState( "back" );
  const devices = useCameraDevices( "wide-angle-camera" );
  const device = devices[cameraPosition];
  const [takePhotoOptions, setTakePhotoOptions] = useState( {
    flash: "off"
  } );

  // select different devices
  // front or back camera
  // tap to focus
  // zoom in

  const takePhoto = async ( ) => {
    try {
      const photo = await camera.current.takePhoto( takePhotoOptions );
      console.log( photo, "photo" );
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

  // TODO: add Android permissions
  if ( device == null ) { return null;}
  return (
    <View style={viewStyles.container}>
      {device !== null && (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          photo
        />
      )}
      <Pressable
        style={viewStyles.flashButton}
        onPress={toggleFlash}
      >
          <Text>flash</Text>
      </Pressable>
      <Pressable
        style={viewStyles.captureButton}
        onPress={takePhoto}
      >
          <Text>camera capture</Text>
      </Pressable>
      <Pressable
        style={viewStyles.cameraFlipButton}
        onPress={flipCamera}
      >
          <Text>flip camera</Text>
      </Pressable>
    </View>
  );
};

export default NormalCamera;
