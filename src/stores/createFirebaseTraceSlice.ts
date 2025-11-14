import perf, { FirebasePerformanceTypes } from "@react-native-firebase/perf";
import { StateCreator } from "zustand";

export enum FIREBASE_TRACES {
  AI_CAMERA_TO_MATCH = "ai_camera_to_match",
}

export enum FIREBASE_TRACE_ATTRIBUTES {
  ONLINE = "online",
}

interface TraceData {
  trace: FirebasePerformanceTypes.Trace;
  // eslint-disable-next-line no-undef
  timeoutId: NodeJS.Timeout;
}

const TRACE_TIMEOUT = 10000;

export interface FirebaseTraceSlice {
  activeTraces: Record<string, TraceData>;
  startTrace: ( traceId: string ) => Promise<void>;
  stopTrace: ( traceId: string ) => Promise<void>;
}

const createFirebaseTraceSlice: StateCreator<FirebaseTraceSlice>
= ( set, get ) => ( {
  activeTraces: {},

  startTrace: async ( traceId: string, attributes: Record<string, string> = {} ) => {
    const trace = await perf().startTrace( traceId );

    const timeoutId = setTimeout( () => {
      get().stopTrace( traceId );
    }, TRACE_TIMEOUT );

    Object.entries( attributes ).forEach( ( [key, value] ) => {
      trace.putAttribute( key, value );
    } );

    set( state => ( {
      activeTraces: {
        ...state.activeTraces,
        [traceId]: { trace, timeoutId }
      }
    } ) );
  },

  stopTrace: async ( traceId: string, attributes: Record<string, string> = {} ) => {
    const { activeTraces } = get();
    const traceData = activeTraces[traceId];
    if ( traceData ) {
      clearTimeout( traceData.timeoutId );

      const { trace } = traceData;
      try {
        Object.entries( attributes ).forEach( ( [key, value] ) => {
          trace.putAttribute( key, value );
        } );
      } catch ( _ ) {
        /* this can error for a few reasons like value being a non-string
        but we still need to stop the trace */
      }

      await trace.stop();

      set( state => {
        const { [traceId]: _, ...remainingTraces } = state.activeTraces;
        return { activeTraces: remainingTraces };
      } );
    }
  }
} );

export default createFirebaseTraceSlice;
