import perf, { FirebasePerformanceTypes } from "@react-native-firebase/perf";
import { StateCreator } from "zustand";

export enum FIREBASE_TRACES {
  AI_CAMERA_TO_MATCH = "ai_camera_to_match",
}

export interface FirebaseTraceSlice {
  activeTraces: Record<string, FirebasePerformanceTypes.Trace>;
  startTrace: ( traceId: string ) => Promise<void>;
  stopTrace: ( traceId: string ) => Promise<void>;
}

const createFirebaseTraceSlice: StateCreator<FirebaseTraceSlice>
= ( set, get ) => ( {
  activeTraces: {},

  startTrace: async ( traceId: string ) => {
    const trace = await perf().startTrace( traceId );
    set( state => ( {
      activeTraces: {
        ...state.activeTraces,
        [traceId]: trace
      }
    } ) );
  },

  stopTrace: async ( traceId: string ) => {
    const { activeTraces } = get();
    const selectedTrace = activeTraces[traceId];
    if ( selectedTrace ) {
      await selectedTrace.stop();
      set( state => {
        const { [traceId]: _, ...remainingTraces } = state.activeTraces;
        return { activeTraces: remainingTraces };
      } );
    }
  }
} );

export default createFirebaseTraceSlice;
