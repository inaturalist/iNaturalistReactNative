import {
  getAnalytics, logEvent,
  setAnalyticsCollectionEnabled,
} from "@react-native-firebase/analytics";
import { getPerformance } from "@react-native-firebase/perf";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "tracking.ts" );

type FirebaseParameters = Record<string, string | number | string[]>

export const logFirebaseEvent = (
  eventId: string,
  parameters?: FirebaseParameters,
) => {
  try {
    const analytics = getAnalytics();
    logEvent( analytics, eventId, parameters );
  } catch ( error ) {
    logger.error( "Error logging firebase event", JSON.stringify( error ) );
  }
};

export const setFirebaseDataCollectionEnabled = ( enabled: boolean ) => {
  try {
    setAnalyticsCollectionEnabled( getAnalytics(), enabled );
    // This looks unusual but is actually the preferred solution
    // https://github.com/invertase/react-native-firebase/blob/81a0f1910955a0295b6b308d5c08c17af0384b04/packages/perf/lib/index.d.ts#L459
    getPerformance().dataCollectionEnabled = enabled;
  } catch ( error ) {
    logger.error( "Error setting firebase data collection", JSON.stringify( error ) );
  }
};

export const logFirebaseScreenView = (
  screenName: string,
) => {
  try {
    const analytics = getAnalytics();
    logEvent( analytics, "screen_view", {
      firebase_screen: screenName,
      firebase_screen_class: screenName,
    } );
  } catch ( error ) {
    logger.error( "Error logging firebase screen view", JSON.stringify( error ) );
  }
};
