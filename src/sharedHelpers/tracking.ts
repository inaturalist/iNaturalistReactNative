import {
  getAnalytics, logEvent
} from "@react-native-firebase/analytics";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "tracking.ts" );

type FirebaseParameters = Record<string, string | number | string[]>;

export const logFirebaseEvent = (
  eventId: string,
  parameters?: FirebaseParameters
) => {
  try {
    const analytics = getAnalytics();
    logEvent( analytics, eventId, parameters );
  } catch ( error ) {
    logger.error( "Error logging firebase event", JSON.stringify( error ) );
  }
};

export const logFirebaseScreenView = (
  screenName: string
) => {
  try {
    const analytics = getAnalytics();
    logEvent( analytics, "screen_view", {
      firebase_screen: screenName,
      firebase_screen_class: screenName
    } );
  } catch ( error ) {
    logger.error( "Error logging firebase screen view", JSON.stringify( error ) );
  }
};
