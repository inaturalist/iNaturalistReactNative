import perf, { FirebasePerformanceTypes } from "@react-native-firebase/perf";
import { StateCreator } from "zustand";

export enum FIREBASE_TRACES {
  AI_CAMERA_TO_MATCH = "ai_camera_to_match",
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

  startTrace: async ( traceId: string ) => {
    const trace = await perf().startTrace( traceId );

    const timeoutId = setTimeout( () => {
      get().stopTrace( traceId );
    }, TRACE_TIMEOUT );

    set( state => ( {
      activeTraces: {
        ...state.activeTraces,
        [traceId]: { trace, timeoutId }
      }
    } ) );
  },

  stopTrace: async ( traceId: string ) => {
    const { activeTraces } = get();
    const traceData = activeTraces[traceId];
    if ( traceData ) {
      clearTimeout( traceData.timeoutId );

      await traceData.trace.stop();

      set( state => {
        const { [traceId]: _, ...remainingTraces } = state.activeTraces;
        return { activeTraces: remainingTraces };
      } );
    }
  }
} );

export default createFirebaseTraceSlice;
