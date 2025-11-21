import {
  getAnalytics, logEvent, logScreenView
} from "@react-native-firebase/analytics";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "tracking.ts" );

type FirebaseParameters = Record<string, string | number | string[]>

export const logFirebaseEvent = (
  eventId: string,
  parameters?: FirebaseParameters
) => {
  try {
    const analytics = getAnalytics();
    logEvent( analytics, eventId, parameters );
  } catch ( error ) {
    logger.error( "Error logging firebase event", error );
  }
};

export const logFirebaseScreenView = (
  screenName: string
) => {
  try {
    const analytics = getAnalytics();
    logScreenView( analytics, { screen_name: screenName, screen_class: screenName } );
  } catch ( error ) {
    logger.error( "Error logging firebase screen view", error );
  }
};
