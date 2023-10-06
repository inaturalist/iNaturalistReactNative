/*
    This file contains various patches for handling the react-native-vision-camera library.
*/
// Needed for react-native-vision-camera v3.3.1
// This patch is used to set the pixelFormat prop which should not be needed because the default
// value would be fine for both platforms.
// However, on Android for the "native" pixelFormat I could not find any method or properties to
// transform the frame into a Bitmap which we need for the classifier currently.
// So we use the "yuv" pixelFormat which is the only one that works for now but less performant.
export const pixelFormatPatch = () => ( Platform.OS === "ios"
  ? "native"
  : "yuv" );

// Needed for react-native-vision-camera v3.3.1
// This patch is used to determine the orientation prop for the Camera component.
// On Android, the orientation prop is not used, so we return null.
// On iOS, the orientation prop is undocumented, but it does get used in a sense that the
// photo metadata shows the correct Orientation only if this prop is set.
export const orientationPatch = deviceOrientation => ( Platform.OS === "android"
  ? null
  : deviceOrientation );
