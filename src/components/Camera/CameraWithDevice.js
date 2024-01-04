// @flow

import { useNavigation } from "@react-navigation/native";
import PermissionGateContainer, { WRITE_MEDIA_PERMISSIONS }
  from "components/SharedComponents/PermissionGateContainer";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useRef, useState
} from "react";
import { StatusBar } from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
// import {
//   RESULTS as PERMISSION_RESULTS
// } from "react-native-permissions";
// Temporarily using a fork so this is to avoid that eslint error. Need to
// remove if/when we return to the main repo
import {
  Camera
  // react-native-vision-camera v3
  // useCameraDevice
  // react-native-vision-camera v2
} from "react-native-vision-camera";
import { useTranslation } from "sharedHooks";
import useDeviceOrientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT
} from "sharedHooks/useDeviceOrientation";

import ARCamera from "./ARCamera/ARCamera";
import useCreateEvidence from "./hooks/useCreateEvidence";
import StandardCamera from "./StandardCamera/StandardCamera";

const isTablet = DeviceInfo.isTablet( );

type Props = {
  addEvidence: ?boolean,
  cameraType: string,
  cameraPosition: string,
  device: Object,
  setCameraPosition: Function,
  backToObsEdit: ?boolean
}

const CameraWithDevice = ( {
  addEvidence,
  cameraType,
  cameraPosition,
  device,
  setCameraPosition,
  backToObsEdit
}: Props ): Node => {
  // screen orientation locked to portrait on small devices
  if ( !isTablet ) {
    Orientation.lockToPortrait( );
  }
  const navigation = useNavigation();
  const { t } = useTranslation( );
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const { deviceOrientation } = useDeviceOrientation( );
  const [addPhotoPermissionResult, setAddPhotoPermissionResult] = useState( null );
  const [checkmarkTapped, setCheckmarkTapped] = useState( false );
  const [taxonResult, setTaxonResult] = useState( null );
  const [modalWasClosed, setModalWasClosed] = useState( false );

  const permissionNeeded = addPhotoPermissionResult === null && checkmarkTapped;

  const {
    createEvidenceForObsEdit
  } = useCreateEvidence( addPhotoPermissionResult, addEvidence );

  const isLandscapeMode = [LANDSCAPE_LEFT, LANDSCAPE_RIGHT].includes( deviceOrientation );

  const flipCamera = ( ) => {
    const newPosition = cameraPosition === "back"
      ? "front"
      : "back";
    setCameraPosition( newPosition );
  };

  const flexDirection = isTablet && isLandscapeMode
    ? "flex-row"
    : "flex-col";

  const navToObsEdit = useCallback( async ( ) => {
    await createEvidenceForObsEdit( taxonResult );
    if ( taxonResult ) {
      setTaxonResult( null );
    }
    navigation.navigate( "ObsEdit" );
  }, [taxonResult, createEvidenceForObsEdit, navigation] );

  const handleCheckmarkPress = localTaxon => {
    setTaxonResult( localTaxon?.id
      ? localTaxon
      : null );
    setCheckmarkTapped( true );
  };

  const onPermissionGranted = ( ) => {
    setAddPhotoPermissionResult( "granted" );
  };

  const onPermissionDenied = ( ) => {
    setAddPhotoPermissionResult( "denied" );
  };

  useEffect( ( ) => {
    if ( modalWasClosed && checkmarkTapped ) {
      setCheckmarkTapped( false );
      setModalWasClosed( false );
      navToObsEdit( );
    }
  }, [navToObsEdit, checkmarkTapped, modalWasClosed] );

  return (
    <View className={`flex-1 bg-black ${flexDirection}`}>
      <StatusBar hidden />
      <PermissionGateContainer
        permissions={WRITE_MEDIA_PERMISSIONS}
        titleDenied={t( "Save-photos-to-your-gallery" )}
        body={t( "iNaturalist-can-save-photos-you-take-in-the-app-to-your-devices-gallery" )}
        buttonText={t( "SAVE-PHOTOS" )}
        icon="gallery"
        image={require( "images/birger-strahl-ksiGE4hMiso-unsplash.jpg" )}
        onPermissionGranted={onPermissionGranted}
        onPermissionDenied={onPermissionDenied}
        withoutNavigation
        permissionNeeded={permissionNeeded}
        setModalWasClosed={setModalWasClosed}
      />
      {cameraType === "Standard"
        ? (
          <StandardCamera
            addEvidence={addEvidence}
            backToObsEdit={backToObsEdit}
            camera={camera}
            device={device}
            flipCamera={flipCamera}
            handleCheckmarkPress={handleCheckmarkPress}
            isLandscapeMode={isLandscapeMode}
          />
        )
        : (
          <ARCamera
            camera={camera}
            device={device}
            flipCamera={flipCamera}
            handleCheckmarkPress={handleCheckmarkPress}
            isLandscapeMode={isLandscapeMode}
          />
        )}
    </View>
  );
};

export default CameraWithDevice;
