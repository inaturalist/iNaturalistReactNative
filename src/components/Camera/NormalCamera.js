// @flow

import React, { useRef } from "react";
import { Text, StyleSheet, View, Pressable } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import type { Node } from "react";

import { viewStyles } from "../../styles/camera/normalCamera";

const NormalCamera = ( ): Node => {
  const camera = useRef<Camera>( null );
  const devices = useCameraDevices( "wide-angle-camera" );
  const device = devices.back;

  // flash toggle on off
  // select different devices
  // front or back camera
  // tap to focus
  // zoom in

  const takePhoto = async ( ) => {
    try {
      const photo = await camera.current.takePhoto( {
        flash: "on"
      } );
      console.log( photo, "photo" );
    } catch ( e ) {
      console.log( e, "couldn't take photo" );
    }
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
        style={viewStyles.captureButton}
        onPress={takePhoto}
      >
          <Text>camera capture</Text>
      </Pressable>
    </View>
  );
};

export default NormalCamera;
