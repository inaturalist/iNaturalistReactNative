import {
  getBuildNumber, getDeviceType, getSystemName, getSystemVersion, getVersion
} from "react-native-device-info";

// User agent being used, when calling the iNat APIs
// eslint-disable-next-line max-len
const userAgent = `iNaturalistRN/${getVersion()} ${getDeviceType()} (Build ${getBuildNumber()}) ${getSystemName()}/${getSystemVersion()}`;

export default userAgent;
