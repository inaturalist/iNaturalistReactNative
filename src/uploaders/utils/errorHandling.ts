import { INatApiError } from "api/error";
import type { TFunction } from "i18next";

export enum RECOVERY_BY {
  LOGIN_AGAIN = "LOGIN_AGAIN"
}
export class RecoverableError extends Error {
  recoveryPossible: boolean;

  recoveryBy: RECOVERY_BY | undefined;

  constructor( message: string ) {
    super( message );
    this.recoveryPossible = true;
    this.recoveryBy = undefined;
  }
}
// https://wbinnssmith.com/blog/subclassing-error-in-modern-javascript/
Object.defineProperty( RecoverableError.prototype, "name", {
  value: "RecoverableError"
} );

function handleUploadError(
  uploadError: Error | INatApiError | RecoverableError,
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
