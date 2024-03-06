import { getUserAgent } from "api/userAgent";
import { create } from "apisauce";
import { getAnonymousJWT, getJWT } from "components/LoginSignUp/AuthenticationService";
import Config from "react-native-config";
import { transportFunctionType } from "react-native-logs";

const API_HOST: string
    = Config.API_URL || process.env.API_URL || "https://api.inaturalist.org/v2";

// Custom transport for posting to iNat API logging
const iNatLogstashTransport: transportFunctionType = async props => {
  const userToken = await getJWT();
  if ( !userToken ) {
    return;
  }
  const anonymousToken = getAnonymousJWT();
  if ( !anonymousToken ) {
    return;
  }
  const api = create( {
    baseURL: API_HOST,
    headers: {
      "User-Agent": getUserAgent(),
      Authorization: [
        userToken,
        anonymousToken
      ].join( ", " )
    }
  } );
  const message
        = typeof props.rawMsg === "string"
          ? props.rawMsg
          : props.rawMsg.join( " " );
  const formData = {
    level: props.level.text,
    message,
    context: props.extension,
    timestamp: new Date().toISOString(),
    // TODO: I couldn't really find a good way to get the error type and backtrace
    // within the react-native-logs transporter paradigm. There could be some string handling to get it
    // but that seems excessive to me because it would need to be adapted to every logger.error call because
    // sometimes the error is used in a template string and sometimes it's an object. Maybe at one point we
    // need to build a solution outside of the transporter paradigm.
    // error_type: some_error_type,
    // backtrace: some_backtrace
  };
  await api.post( "/log", formData );
};

export default iNatLogstashTransport;
