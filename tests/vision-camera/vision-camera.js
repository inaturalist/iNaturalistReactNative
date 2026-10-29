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

  /*
    Every time the component updates we invoke the frame output's onFrame callback
    with a mocked frame that does not include any kind of image data at all.
    Running it only on component update means it only is called a few times and not
    every second (or so - depending on fps). This is enough to satisfy the e2e test
    though because the mocked prediction needs to appear only once to be found by the
    test matcher. I tried running it with a timer every second but since it never idles
    the test never finishes.
  */
  componentDidUpdate() {
    const { outputs } = this.props;
    outputs?.forEach( output => {
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
        path: destPath,
        metadata: { Orientation: 1 },
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
        ...testPhoto,
        path: newPath,
        metadata: {
          Orientation: testPhoto.orientation,
        },
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
