// MOB-1622 capture-resolution spike. NOT FOR MERGE.
// Logs what photo sizes the camera offers and what it actually delivers.
// Read the output in the app log file (Debug > Log) or Metro, prefix "CaptureSpike".
import { stat } from "@dr.pogodin/react-native-fs";
import * as Exify from "@lodev09/react-native-exify";
import { Image, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import type {
  CameraDevice,
  CameraPhotoOutput,
  CameraSessionConfig,
  Size,
} from "react-native-vision-camera";
import { CommonResolutions } from "react-native-vision-camera";
import { logWithoutRemote } from "sharedHelpers/logger";

const logger = logWithoutRemote.extend( "CaptureSpike" );

// Flip and reload JS to compare runs.
// "current": today's targets (HIGHEST_4_3 / HIGHEST_16_9)
// "small": ask the sensor for ~2048px on the long edge
type SpikeMode = "current" | "small";
const SPIKE_MODE: SpikeMode = "small";

// undefined = VisionCamera default (0.9). Set to 1.0 to test a q100 capture.
export const SPIKE_PHOTO_QUALITY: number | undefined = undefined;

const SMALL_TARGETS = {
  standard: { width: 1536, height: 2048 },
  ai: { width: 1152, height: 2048 },
};

export const spikeTargetResolution = ( cameraType?: string ): Size => {
  if ( SPIKE_MODE === "small" ) {
    return cameraType === "AI"
      ? SMALL_TARGETS.ai
      : SMALL_TARGETS.standard;
  }
  return cameraType === "AI"
    ? CommonResolutions.HIGHEST_16_9
    : CommonResolutions.HIGHEST_4_3;
};

const fmt = ( size?: Size | null ) => ( size
  ? `${size.width}x${size.height}`
  : "none" );

const deviceLabel = ( ) => `${DeviceInfo.getModel( )} ${Platform.OS} ${Platform.Version}`;

export const logSupportedPhotoResolutions = ( device?: CameraDevice ) => {
  if ( !device ) return;
  try {
    const sizes = [...device.getSupportedResolutions( "photo" )]
      .sort( ( a, b ) => ( b.width * b.height ) - ( a.width * a.height ) );
    logger.info(
      `[${deviceLabel( )}] device=${device.id} position=${device.position} `
      + `mode=${SPIKE_MODE} supported photo sizes (${sizes.length}): `
      + `${sizes.map( fmt ).join( ", " )}`,
    );
  } catch ( e ) {
    logger.error( "getSupportedResolutions failed", e );
  }
};

export const logSessionConfig = (
  config: CameraSessionConfig,
  photoOutput: CameraPhotoOutput,
) => {
  try {
    // On iOS isPhotoHDREnabled == activeFormat.isHighestPhotoQualitySupported
    // (Smart HDR / Deep Fusion eligible), and toString() includes the format.
    logger.info(
      `[${deviceLabel( )}] session config: `
      + `highestPhotoQuality/photoHDR=${config.isPhotoHDREnabled} binned=${config.isBinned} `
      + `photoOutput.currentResolution=${fmt( photoOutput.currentResolution )} `
      + `config=${config.toString( )}`,
    );
  } catch ( e ) {
    logger.error( "logSessionConfig failed", e );
  }
};

const getImageSize = ( uri: string ): Promise<Size> => new Promise( ( resolve, reject ) => {
  Image.getSize( uri, ( width, height ) => resolve( { width, height } ), reject );
} );

export const logCapturedPhoto = async (
  uri: string,
  photoOutput: CameraPhotoOutput,
  cameraType: string | undefined,
  captureMs: number,
) => {
  try {
    const [size, fileStat, exif] = await Promise.all( [
      getImageSize( uri ),
      stat( uri ),
      Exify.read( uri ).catch( ( ) => null ),
    ] );
    logger.info(
      `[${deviceLabel( )}] captured mode=${SPIKE_MODE} camera=${cameraType} `
      + `target=${fmt( spikeTargetResolution( cameraType ) )} `
      + `quality=${SPIKE_PHOTO_QUALITY ?? "default(0.9)"} `
      + `currentResolution=${fmt( photoOutput.currentResolution )} `
      + `decoded=${fmt( size )} `
      + `exifPixels=${exif?.PixelXDimension ?? "?"}x${exif?.PixelYDimension ?? "?"} `
      + `exifOrientation=${exif?.Orientation ?? "?"} `
      + `bytes=${fileStat.size} ext=${uri.split( "." ).pop( )} `
      + `captureMs=${Math.round( captureMs )}`,
    );
  } catch ( e ) {
    logger.error( "logCapturedPhoto failed", e );
  }
};
