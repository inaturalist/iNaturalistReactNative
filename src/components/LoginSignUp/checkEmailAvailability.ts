import { log } from "sharedHelpers/logger";

import { emailAvailable } from "./AuthenticationService";

const logger = log.extend( "checkEmailAvailability" );

export type EmailAvailability = "available" | "taken" | "error";

// Whether an email can be used for a new account. Any request failure, or a
// response without a yes/no answer, is "error" rather than "taken", so the
// user isn't told their email is in use when it might not be.
const checkEmailAvailability = async ( email: string ): Promise<EmailAvailability> => {
  let available: boolean | undefined;
  try {
    available = await emailAvailable( email );
  } catch ( emailAvailableError ) {
    logger.error( "Email availability check failed", emailAvailableError );
    return "error";
  }
  if ( typeof available !== "boolean" ) {
    logger.error( "Email availability check returned no answer", available );
    return "error";
  }
  return available
    ? "available"
    : "taken";
};

export default checkEmailAvailability;
