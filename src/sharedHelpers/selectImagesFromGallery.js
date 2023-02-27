import { Platform } from "react-native";
import ImagePicker from "react-native-image-crop-picker";

const handleIosImage = image => {
  const gpsData = image.exif["{GPS}"];
  const latitudeNegative = gpsData?.LatitudeRef === "S";
  const longitudeNegative = gpsData?.LongitudeRef === "W";

  let latitude = gpsData?.Latitude ?? null;
  let longitude = gpsData?.Longitude ?? null;

  if ( latitude && latitudeNegative ) {
    latitude *= -1;
  }

  if ( longitude && longitudeNegative ) {
    longitude *= -1;
  }

  return {
    timestamp: parseInt( image.creationDate, 10 ),
    type: "image",
    location: {
      altitude: gpsData?.Altitude || 0,
      longitude,
      latitude,
      heading: gpsData?.ImgDirection || 0,
      speed: gpsData?.Speed || 0
    },
    image: {
      width: image.width,
      height: image.height,
      filename: image.filename,
      fileSize: image.size,
      playableDuration: null,
      uri: `file://${image.path}`
    }
  };
};

const handleAndroidImage = image => {
  const gpsData = image.exif;

  return {
    timestamp: parseInt( image.modificationDate, 10 ),
    type: "image",
    location: {
      altitude: gpsData?.Altitude || 0,
      longitude: gpsData?.Longitude,
      latitude: gpsData?.Latitude,
      heading: gpsData?.ImgDirection || 0,
      speed: gpsData?.Speed || 0
    },
    image: {
      width: image.width,
      height: image.height,
      filename: image.filename,
      fileSize: image.size,
      playableDuration: null,
      uri: image.path
    }
  };
};

const selectImagesFromGallery = async ( { resize } ) => {
  const pickerParams = {
    mediaType: "photo",
    multiple: true,
    maxFiles: 20,
    includeExif: true,
    loadingLabelText: ""
  };

  if ( resize ) {
    pickerParams.compressImageMaxWidth = 2048;
    pickerParams.compressImageMaxHeight = 2048;
  }

  const selectedImages = await ImagePicker.openPicker( pickerParams );

  return selectedImages.map( Platform === "ios" ? handleIosImage : handleAndroidImage );
};

export default selectImagesFromGallery;
