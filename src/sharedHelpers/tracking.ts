import analytics from "@react-native-firebase/analytics";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "tracing.ts" );

type FirebaseParameters = Record<string, string | number | string[]>

// eslint-disable-next-line import/prefer-default-export
export const logFirebaseEvent = (
  eventId: string,
  parameters: FirebaseParameters
) => {
  // eslint-disable-next-line no-undef
  if ( __DEV__ ) {
    logger.info( `Firebase event: ${eventId} ${JSON.stringify( parameters )}` );
  }
  void analytics().logEvent( eventId, parameters );
};
