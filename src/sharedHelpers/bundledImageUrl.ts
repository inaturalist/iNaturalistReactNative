import type { ImageRequireSource } from "react-native";
import { Image, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

// Turns a bundled image (`require( "images/..." )`) into a URL that FasterImageView can load.
// `Image` takes the `require` result directly and does not need this.
//
// In an Android release build, React Native resolves a bundled image to a bare drawable name
// (e.g. `src_images_background_phonehand`). `Image` knows to look that up as a resource,
// but FasterImageView hands the string to Coil, which cannot load a bare name. Coil does
// load `android.resource://<package>/drawable/<name>`, so we build that.
//
// Debug builds resolve to an `http://localhost:8081/assets/...` URL from Metro, and iOS
// resolves to a `file://` URL; both already work with FasterImageView, so they pass through.
const bundledImageUrl = ( source: ImageRequireSource ): string => {
  const { uri } = Image.resolveAssetSource( source );
  if ( Platform.OS === "android" && !uri.includes( "://" ) ) {
    return `android.resource://${DeviceInfo.getBundleId()}/drawable/${uri}`;
  }
  return uri;
};

export default bundledImageUrl;
