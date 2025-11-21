import {
  getAnalytics, logEvent, logScreenView
} from "@react-native-firebase/analytics";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "tracing.ts" );

type FirebaseParameters = Record<string, string | number | string[]>

// eslint-disable-next-line import/prefer-default-export
export const logFirebaseEvent = (
  eventId: string,
  parameters?: FirebaseParameters
) => {
  // eslint-disable-next-line no-undef
  if ( __DEV__ ) {
    logger.info( `Firebase event: ${eventId} ${JSON.stringify( parameters )}` );
  }
  const analytics = getAnalytics();
  logEvent( analytics, eventId, parameters );
};

export const logFirebaseScreenView = (
  screenName: string
) => {
  // eslint-disable-next-line no-undef
  if ( __DEV__ ) {
    logger.info( `Firebase screen view: ${screenName}` );
  }
  const analytics = getAnalytics();
  logScreenView( analytics, { screen_name: screenName, screen_class: screenName } );
};
