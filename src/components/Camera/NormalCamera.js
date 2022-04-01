// @flow

import React, { useRef, useState, useEffect, useContext } from "react";
import { Text, View, Pressable, PermissionsAndroid } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";
import uuid from "react-native-uuid";

import { useUserLocation } from "../../sharedHooks/useUserLocation";
import { viewStyles, textStyles } from "../../styles/camera/normalCamera";
import { ObsEditContext } from "../../providers/contexts";
import CameraView from "./CameraView";
import TopPhotos from "./TopPhotos";

const NormalCamera = ( ): Node => {
  const [permission, setPermission] = useState( null );
  const { addPhotos } = useContext( ObsEditContext );
  const latLng = useUserLocation( );
  const latitude = latLng && latLng.latitude;
  const longitude = latLng && latLng.longitude;
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
    const requestAndroidPermissions = async ( ) => {
      try {
        const granted = await PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.CAMERA );
        console.log( granted, "camera permission android" );
        if ( granted === PermissionsAndroid.RESULTS.GRANTED ) {
          setPermission( "granted" );
        } else {
          setPermission( "denied" );
        }
      } catch ( err ) {
        console.log( err, "error requesting android permissions" );
        setPermission( "not-determined" );
      }
    };

    navigation.addListener( "focus", ( ) => {
      requestAndroidPermissions( );
    } );
  }, [navigation] );

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
      const parsedPhoto = {
        latitude,
        longitude,
        positional_accuracy: latLng && latLng.accuracy,
        // TODO: check that this formatting for observed_on_string
        // shows up as expected on web,
        observed_on_string: photo.metadata["{Exif}"].DateTimeOriginal,
        uri: `file://${photo.path}`,
        // exif: photo.metadata["{Exif}"],
        uuid: uuid.v4( )
      };
      // only 10 photos allowed
      if ( observationPhotos.length < 10 ) {
        setObservationPhotos( observationPhotos.concat( [parsedPhoto] ) );
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
    addPhotos( observationPhotos );
    navigation.navigate( "ObsEdit" );
  };

  // $FlowFixMe
  if ( permission === "denied" ) {
    return (
      <View style={viewStyles.container}>
        <Text style={textStyles.whiteText}>check camera permissions in phone settings</Text>
      </View>
    );
  }
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
