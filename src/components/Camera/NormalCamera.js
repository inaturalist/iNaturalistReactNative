// @flow

import React, { useRef, useState, useEffect, useContext } from "react";
import { Text, View, Pressable } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import { viewStyles } from "../../styles/camera/normalCamera";
import { ObsEditContext } from "../../providers/contexts";
import CameraView from "./CameraView";
import TopPhotos from "./TopPhotos";
import ObservationPhoto from "../../models/ObservationPhoto";

const NormalCamera = ( ): Node => {
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
  const [observationPhotos, setObservationPhotos] = useState( [] );

  useEffect( ( ) => {
    navigation.addListener( "blur", ( ) => {
      if ( observationPhotos.length > 0 ) {
        setObservationPhotos( [] );
      }
    } );
  }, [navigation, observationPhotos] );

  const takePhoto = async ( ) => {
    try {
      const photo = await camera.current.takePhoto( takePhotoOptions );
      const obsPhoto = await ObservationPhoto.formatObsPhotoFromNormalCamera( photo );
      // only 10 photos allowed
      if ( observationPhotos.length < 10 ) {
        setObservationPhotos( observationPhotos.concat( [obsPhoto] ) );
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
    console.log( observationPhotos, "obs phtoos in camera" );
    addPhotos( observationPhotos );
    navigation.navigate( "ObsEdit" );
  };

  return (
    <View style={viewStyles.container}>
      {device && <CameraView device={device} camera={camera} />}
      <TopPhotos observationPhotos={observationPhotos} />
      <View style={viewStyles.row}>
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
      <Pressable
        style={viewStyles.cameraFlipButton}
        onPress={navToObsEdit}
      >
          <Text>next</Text>
      </Pressable>
    </View>
  );
};

export default NormalCamera;
