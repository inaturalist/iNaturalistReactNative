import { Platform } from "react-native";
import {
  getApiLevel,
  getBrand,
  getBuildNumber,
  getDeviceId,
  getDeviceName,
  getDeviceType,
  getSystemName,
  getSystemVersion,
  getVersion
} from "react-native-device-info";

const DETAILS = [
  `Build ${getBuildNumber()}`,
  `${getSystemName()} ${getSystemVersion()}`,
  getDeviceId( ),
  getDeviceType( )
];

async function getOtherDetails( ) {
  DETAILS.push( `${getBrand( )} ${await getDeviceName( )}` );
  if ( Platform.OS === "android" ) {
    DETAILS.push( `SDK ${await getApiLevel( )}` );
  }
}
getOtherDetails( );

// User agent being used, when calling the iNat APIs
function getUserAgent( ) {
  return `iNaturalistRN/${getVersion()} (${DETAILS.join( "; " )})`;
}

export {
  DETAILS,
  getUserAgent
};
