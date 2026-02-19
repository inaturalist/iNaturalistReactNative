import type { FirebasePerformanceTypes } from "@react-native-firebase/perf";
import { getPerformance } from "@react-native-firebase/perf";
import type { StateCreator } from "zustand";

import { log } from "../../react-native-logs.config";

const logger = log.extend( "createFirebaseTraceSlice.ts" );

export enum FIREBASE_TRACES {
  AI_CAMERA_TO_MATCH = "ai_camera_to_match",
}

export enum FIREBASE_TRACE_ATTRIBUTES {
  ONLINE = "online",
  DID_TIMEOUT = "did_timeout",
  HAS_SAVE_PHOTO_PERMISSION = "has_save_photo_permission",
}

interface TraceData {
  trace: FirebasePerformanceTypes.Trace;
  timeoutId: ReturnType<typeof setTimeout>;
}

type FirebaseTraceAttributes = Partial<Record<FIREBASE_TRACE_ATTRIBUTES, string | number>>;

const TRACE_TIMEOUT = 10000;

const applyTraceAttributes = (
  trace: FirebasePerformanceTypes.Trace,
  attributes: FirebaseTraceAttributes,
): void => {
  try {
    Object.entries( attributes ).forEach( ( [key, value] ) => {
      if ( typeof value === "string" ) {
      // Firebase will silently fail if we exceed these limits
        if ( key.length <= 40 && value.length <= 100 ) {
          trace.putAttribute( key, value );
        } else {
          logger.error( `Failed to set firebase attribute (too long): ${key}=${value}` );
        }
      } else if ( key.length <= 32 && /^(?!_)[^\s](?:.*[^\s])?$/.test( key ) ) {
        /* metric key constraint: "Must not have a leading or trailing whitespace,
        no leading underscore '_' character and have a max length of 32 characters." */
        trace.putMetric( key, value );
      }
    } );
  } catch ( error ) {
    logger.error( "Error setting firebase trace attributes", JSON.stringify( error ) );
  }
};

interface FirebaseTraceSlice {
  activeFirebaseTraces: Record<string, TraceData>;
  startFirebaseTrace: ( traceId: string, attributes: FirebaseTraceAttributes ) => Promise<void>;
  stopFirebaseTrace: ( traceId: string, attributes: FirebaseTraceAttributes ) => Promise<void>;
}

const createFirebaseTraceSlice: StateCreator<FirebaseTraceSlice>
= ( set, get ) => ( {
  activeFirebaseTraces: {},

  startFirebaseTrace: async ( traceId: string, attributes: FirebaseTraceAttributes = {} ) => {
    const perf = getPerformance();
    const trace = await perf.startTrace( traceId );

    const timeoutId = setTimeout( () => {
      get().stopFirebaseTrace( traceId, { [FIREBASE_TRACE_ATTRIBUTES.DID_TIMEOUT]: "true" } );
    }, TRACE_TIMEOUT );

    applyTraceAttributes( trace, attributes );

    set( state => ( {
      activeFirebaseTraces: {
        ...state.activeFirebaseTraces,
        [traceId]: { trace, timeoutId },
      },
    } ) );
  },

  stopFirebaseTrace: async ( traceId: string, attributes: FirebaseTraceAttributes = {} ) => {
    const { activeFirebaseTraces } = get();
    const traceData = activeFirebaseTraces[traceId];
    if ( traceData ) {
      clearTimeout( traceData.timeoutId );

      const { trace } = traceData;
      applyTraceAttributes( trace, attributes );

      await trace.stop();

      set( state => {
        const { [traceId]: _, ...remainingTraces } = state.activeFirebaseTraces;
        return { activeFirebaseTraces: remainingTraces };
      } );
    }
  },
} );

export default createFirebaseTraceSlice;
