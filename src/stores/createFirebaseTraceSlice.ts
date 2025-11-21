import { FirebasePerformanceTypes, getPerformance } from "@react-native-firebase/perf";
import { StateCreator } from "zustand";

import { log } from "../../react-native-logs.config";

const logger = log.extend( "createFirebaseTraceSlice.ts" );

export enum FIREBASE_TRACES {
  AI_CAMERA_TO_MATCH = "ai_camera_to_match",
}

export enum FIREBASE_TRACE_ATTRIBUTES {
  ONLINE = "online",
}

interface TraceData {
  trace: FirebasePerformanceTypes.Trace;
  timeoutId: ReturnType<typeof setTimeout>;
}

const TRACE_TIMEOUT = 10000;

export interface FirebaseTraceSlice {
  activeFirebaseTraces: Record<string, TraceData>;
  startFirebaseTrace: ( traceId: string ) => Promise<void>;
  stopFirebaseTrace: ( traceId: string ) => Promise<void>;
}

const createFirebaseTraceSlice: StateCreator<FirebaseTraceSlice>
= ( set, get ) => ( {
  activeFirebaseTraces: {},

  startFirebaseTrace: async ( traceId: string, attributes: Record<string, string> = {} ) => {
    const perf = getPerformance();
    const trace = await perf.startTrace( traceId );

    const timeoutId = setTimeout( () => {
      get().stopFirebaseTrace( traceId );
    }, TRACE_TIMEOUT );

    try {
      Object.entries( attributes ).forEach( ( [key, value] ) => {
        trace.putAttribute( key, value );
      } );
    } catch ( error ) {
      logger.error( "Error setting firebase trace attributes on start", error );
    }

    set( state => ( {
      activeFirebaseTraces: {
        ...state.activeFirebaseTraces,
        [traceId]: { trace, timeoutId }
      }
    } ) );
  },

  stopFirebaseTrace: async ( traceId: string, attributes: Record<string, string> = {} ) => {
    const { activeFirebaseTraces } = get();
    const traceData = activeFirebaseTraces[traceId];
    if ( traceData ) {
      clearTimeout( traceData.timeoutId );

      const { trace } = traceData;
      try {
        Object.entries( attributes ).forEach( ( [key, value] ) => {
          trace.putAttribute( key, value );
        } );
      } catch ( error ) {
        logger.error( "Error setting firebase trace attributes on stop", error );
      }

      await trace.stop();

      set( state => {
        const { [traceId]: _, ...remainingTraces } = state.activeFirebaseTraces;
        return { activeFirebaseTraces: remainingTraces };
      } );
    }
  }
} );

export default createFirebaseTraceSlice;
