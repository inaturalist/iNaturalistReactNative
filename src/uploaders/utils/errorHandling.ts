import { INatApiError } from "api/error";
import type { TFunction } from "i18next";

function handleUploadError(
  uploadError: Error | INatApiError,
  t: TFunction
): string {
  let { message } = uploadError;
  if ( uploadError?.json?.errors ) {
    // TODO localize comma join
    message = uploadError.json.errors.map( e => {
      if ( e.message?.errors ) {
        if ( typeof ( e.message.errors.flat ) === "function" ) {
          return e.message.errors.flat( ).join( ", " );
        }
        return String( e.message.errors );
      }
      // 410 error for observations previously deleted uses e.message?.error format
      return e.message?.error || e.message;
    } ).join( ", " );
  } else if ( uploadError.message?.match( /Network request failed/ ) ) {
    message = t( "Connection-problem-Please-try-again-later" );
  } else {
    throw uploadError;
  }
  return message;
}

export default handleUploadError;
