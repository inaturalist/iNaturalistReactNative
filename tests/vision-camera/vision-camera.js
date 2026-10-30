import {
  copyAssetsFileIOS,
  copyFile,
  ExternalDirectoryPath,
  TemporaryDirectoryPath,
} from "@dr.pogodin/react-native-fs";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import React from "react";
import { Platform, View } from "react-native";

const mockFrame = {
  isValid: true,
  width: 1920,
  height: 1080,
  bytesPerRow: 1920,
  planesCount: 1,
  isMirrored: false,
  timestamp: 0,
  orientation: "portrait",
  pixelFormat: "yuv",
  // Returns a fake ArrayBuffer
  toArrayBuffer: () => new ArrayBuffer( 1920 * 1080 ),
  toString: () => "Frame",
  getNativeBuffer: () => ( {
    // Returns a fake pointer
    pointer: 0,
    delete: () => null,
  } ),
  incrementRefCount: () => null,
  decrementRefCount: () => null,
  dispose: () => null,
};

const style = { flex: 1, backgroundColor: "red" };

export class mockCamera extends React.PureComponent {
  static async getAvailableCameraDevices() {
    return [
      {
        position: "back",
      },
    ];
  }

  framesDispatched = false;

  /*
    Deliver one mocked frame when the camera becomes active. Do not invoke onFrame on
    every parent re-render (e.g. after setResult from a prediction) or Detox never
    idles and the AI camera e2e test hits the 900s Jest timeout.
  */
  componentDidMount() {
    this.props.onStarted?.();
    this.maybeDispatchMockFrame();
  }

  componentDidUpdate( prevProps ) {
    if ( prevProps.isActive && !this.props.isActive ) {
      this.framesDispatched = false;
    }
    this.maybeDispatchMockFrame();
  }

  maybeDispatchMockFrame() {
    const { isActive, outputs } = this.props;
    if ( !isActive || this.framesDispatched ) {
      return;
    }
    const hasFrameOutput = outputs?.some( output => typeof output?.onFrame === "function" );
    if ( !hasFrameOutput ) {
      return;
    }
    this.framesDispatched = true;
    outputs.forEach( output => {
      output?.onFrame?.( mockFrame );
    } );
  }

  render() {
    return <View style={style} collapsable={false} />;
  }
}

export const mockSortDevices = ( _left, _right ) => 1;

// Mirrors react-native-vision-camera/lib/utils/CommonResolutions (used by CameraContainer).
export const CommonResolutions = {
  HIGHEST_16_9: { width: 9000, height: 16000 },
  HIGHEST_4_3: { width: 30000, height: 40000 },
};

const mockDevice = {
  hasFlash: true,
  hasTorch: true,
  id: "1",
  isVirtualDevice: true,
  maxZoom: 12.931958198547363,
  minZoom: 1,
  name: "back (mock)",
  physicalDevices: [
    { type: "ultra-wide-angle" },
    { type: "wide-angle" },
    { type: "telephoto" },
  ],
  position: "back",
  supportsFocusMetering: true,
  supportsLowLightBoost: false,
  zoomLensSwitchFactors: [2, 6],
};

// Stable identities. A fresh object or function on each call changes hook
// dependencies (camera focus reset, location permission) and re-renders forever,
// so Detox never sees the app go idle.
export const mockUseCameraDevice = _deviceType => mockDevice;
export const mockUseCameraDevices = () => [mockDevice];

const mockAsyncRunner = {
  runAsync: cb => {
    cb();
    return true;
  },
};
export const mockUseAsyncRunner = () => mockAsyncRunner;

export const mockUseFrameOutput = options => options;

const mockCapturePhotoToFile = async ( _settings, callbacks = {} ) => {
  if ( Platform.OS === "android" ) {
    /*
        On Android, copyAssetsFileIOS is not available. Instead, copy the test
        image that was pushed to the app's external files directory by
        iNatE2eBeforeAll (via `adb push e2e/animal.jpg`).
        ExternalDirectoryPath = /sdcard/Android/data/<package>/files/
        which is accessible by the app without extra permissions.
      */
    const sourcePath = `${ExternalDirectoryPath}/e2e_test.jpg`;
    const destPath = `${TemporaryDirectoryPath}/temp.jpg`;
    try {
      await copyFile( sourcePath, destPath );
      return {
        filePath: destPath,
      };
    } catch ( err ) {
      console.log( "Error copying test photo on Android:", err );
      return null;
    }
  }

  return CameraRoll.getPhotos( {
    first: 20,
    assetType: "Photos",
  } )
    .then( async r => {
      /*
          Basically, here, we are reading the newest twenty photos from the simulators gallery
          and return the oldest one of those. Copy it to a new path and treat it as a new photo.
        */
      const testPhoto = r.edges[r.edges.length - 1].node.image;
      let oldUri = testPhoto.uri;
      if ( testPhoto.uri.includes( "ph://" ) ) {
        let id = testPhoto.uri.replace( "ph://", "" );
        id = id.substring( 0, id.indexOf( "/" ) );
        oldUri = `assets-library://asset/asset.jpg?id=${id}&ext=jpg`;
        console.log( `Converted file uri to ${oldUri}` );
      }
      const encodedUri = encodeURI( oldUri );
      const destPath = `${TemporaryDirectoryPath}/temp.jpg`;
      const newPath = await copyAssetsFileIOS( encodedUri, destPath, 0, 0 );
      const photo = { uri: newPath, predictions: [] };
      if ( typeof photo !== "object" ) {
        console.log( "photo is not an object", typeof photo );
        return null;
      }
      // Not sure if this is required
      callbacks.onDidCapturePhoto?.();
      return {
        filePath: newPath,
      };
    } )
    .catch( err => {
      console.log( "Error getting photos", err );
      return null;
    } );
};

export const mockUsePhotoOutput = () => ( {
  capturePhotoToFile: mockCapturePhotoToFile,
} );
