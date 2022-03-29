// @flow

import React, { useRef, useState, useEffect, useContext } from "react";
import { Text, StyleSheet, View, Pressable, Animated, Image } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import type { Node } from "react";
import { FlatList, PinchGestureHandler, TapGestureHandler } from "react-native-gesture-handler";
import Reanimated, { Extrapolate, interpolate, useAnimatedGestureHandler, useAnimatedProps, useSharedValue } from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/core";
import { useNavigation } from "@react-navigation/native";
import uuid from "react-native-uuid";
import { useUserLocation } from "../../sharedHooks/useUserLocation";

import { viewStyles, imageStyles, textStyles } from "../../styles/camera/normalCamera";
import { useIsForeground } from "./hooks/useIsForeground";
import FocusSquare from "./FocusSquare";
import { ObsEditContext } from "../../providers/contexts";

// a lot of the camera functionality (pinch to zoom, etc.) is lifted from the example library:
// https://github.com/mrousavy/react-native-vision-camera/blob/7335883969c9102b8a6d14ca7ed871f3de7e1389/example/src/CameraPage.tsx

const SCALE_FULL_ZOOM = 3;

const ReanimatedCamera = Reanimated.createAnimatedComponent( Camera );
Reanimated.addWhitelistedNativeProps( {
  zoom: true
} );

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
  const zoom = useSharedValue( 0 );
  const [tappedCoordinates, setTappedCoordinates] = useState( null );
  const tapToFocusAnimation = useRef( new Animated.Value( 0 ) ).current;
  const [observationPhotos, setObservationPhotos] = useState( [] );

  useEffect( ( ) => {
    navigation.addListener( "focus", async ( ) => {
      const cameraPermission = await Camera.getCameraPermissionStatus( );
      setPermission( cameraPermission );
      if ( cameraPermission === "not-determined" ) {
        await Camera.requestCameraPermission( );
      }
      if ( observationPhotos.length > 0 ) {
        setObservationPhotos( [] );
      }
    } );
  }, [navigation, observationPhotos.length] );

  // check if camera page is active
  const isFocused = useIsFocused( );
  const isForeground = useIsForeground( );
  const isActive = isFocused && isForeground;

  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min( device?.maxZoom ?? 1, 5 );

  const cameraAnimatedProps = useAnimatedProps( () => {
    const z = Math.max( Math.min( zoom.value, maxZoom ), minZoom );
    return {
      zoom: z
    };
  }, [maxZoom, minZoom, zoom] );
  //#endregion

  // select different devices
  // front or back camera
  // tap to focus
  // zoom in

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

    //#region Effects
    const neutralZoom = device?.neutralZoom ?? 1;
    useEffect( ( ) => {
      // Run everytime the neutralZoomScaled value changes. (reset zoom when device changes)
      zoom.value = neutralZoom;
    }, [neutralZoom, zoom] );

  //#region Pinch to Zoom Gesture
  // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
  // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
  const onPinchGesture = useAnimatedGestureHandler( {
    onStart: ( _, context ) => {
      context.startZoom = zoom.value;
    },
    onActive: ( event, context ) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate( event.scale, [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM], [-1, 0, 1], Extrapolate.CLAMP );
      zoom.value = interpolate( scale, [-1, 0, 1], [minZoom, startZoom, maxZoom], Extrapolate.CLAMP );
    }
  } );
  //#endregion

  const tapToFocus = async ( { nativeEvent } ) => {
    try {
      await camera.current.focus( { x: nativeEvent.x, y: nativeEvent.y } );
      tapToFocusAnimation.setValue( 1 );
      setTappedCoordinates( nativeEvent );
    } catch ( e ) {
      console.log( e, "couldn't tap to focus" );
    }
  };

  const renderSmallPhoto = ( { item } ) => (
    <Image source={{ uri: item.uri }} style={imageStyles.smallPhoto} />
  );

  const navToObsEdit = ( ) => {
    addPhotos( observationPhotos );
    navigation.navigate( "ObsEdit" );
  };

  if ( device == null ) { return null; }
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
      {device !== null && (
        <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
          <Reanimated.View style={StyleSheet.absoluteFill}>
            <TapGestureHandler onHandlerStateChange={tapToFocus} numberOfTaps={1}>
              <ReanimatedCamera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isActive}
                photo
                animatedProps={cameraAnimatedProps}
              />
            </TapGestureHandler>
          </Reanimated.View>
        </PinchGestureHandler>
      )}
      <FlatList
        data={observationPhotos}
        contentContainerStyle={viewStyles.photoContainer}
        renderItem={renderSmallPhoto}
        horizontal
      />
      <FocusSquare
        tapToFocusAnimation={tapToFocusAnimation}
        tappedCoordinates={tappedCoordinates}
      />
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
