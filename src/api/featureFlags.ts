import inatjs from "inaturalistjs";
import { FeatureFlag } from "stores/createFeatureFlagSlice";

import type { ErrorWithResponse } from "./error";
import handleError from "./error";
import type { ApiOpts } from "./types";

const knownFlags = new Set<string>( Object.values( FeatureFlag ) );

// Flipper flags the app doesn't define, and non-boolean values, are dropped
const fetchFeatureFlags = async (
  opts: ApiOpts = {},
): Promise<Partial<Record<FeatureFlag, boolean>>> => {
  try {
    const { flags } = await inatjs.feature_flags.get( {}, opts );
    return Object.fromEntries(
      Object.entries( flags || {} ).filter(
        ( [key, value] ) => knownFlags.has( key ) && typeof value === "boolean",
      ),
    );
  } catch ( e ) {
    // handleError throws unless passed `throw: false`
    throw await handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchFeatureFlags" } },
    );
  }
};

export default fetchFeatureFlags;
