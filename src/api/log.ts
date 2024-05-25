import { getUserAgent } from "api/userAgent";
import { create } from "apisauce";
// eslint-disable-next-line import/no-cycle
import { getAnonymousJWT, getJWT } from "components/LoginSignUp/AuthenticationService";
import Config from "react-native-config";
import { transportFunctionType } from "react-native-logs";
import { installID } from "sharedHelpers/userData";

const API_HOST: string
    = Config.API_URL || process.env.API_URL || "https://api.inaturalist.org/v2";

const api = create( {
  baseURL: API_HOST,
  headers: {
    "User-Agent": getUserAgent( ),
    "X-Installation-ID": installID( )
  }
} );

function isError( error ) {
  if ( error instanceof Error ) return true;
  if ( error && error.stack && error.message ) return true;
  return false;
}

// Custom transport for posting to iNat API logging
const iNatLogstashTransport: transportFunctionType = async props => {
  const userToken = await getJWT();
  const anonymousToken = getAnonymousJWT();
  if ( !userToken && !anonymousToken ) {
    return;
  }
  // if message is an Error or is an array ending in an error, extract
  // error_type and backtrace
  let message;
  let backtrace;
  let errorType;
  if ( typeof ( props.rawMsg ) === "string" ) {
    message = props.rawMsg;
  } else if ( isError( props.rawMsg ) ) {
    ( { message } = props.rawMsg );
    errorType = props.rawMsg.constructor?.name;
    backtrace = props.rawMsg.stack;
  } else if ( Array.isArray( props.rawMsg ) ) {
    const last = props.rawMsg.at( -1 );
    if ( isError( last ) ) {
      ( { message } = last );
      errorType = last.constructor?.name;
      backtrace = last.stack;
    } else {
      message = props.rawMsg.join( " " );
    }
  } else {
    message = props.rawMsg;
  }
  const formData = {
    level: props.level.text,
    message,
    context: props.extension,
    timestamp: new Date().toISOString(),
    error_type: errorType,
    backtrace
  };
  await api.post( "/log", formData, {
    headers: {
      Authorization: [
        userToken,
        anonymousToken
      ].flat( ).join( ", " )
    }
  } );
};

export default iNatLogstashTransport;
