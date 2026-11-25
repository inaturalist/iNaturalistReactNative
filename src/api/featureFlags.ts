import inatjs from "inaturalistjs";
import { FeatureFlag, featureFlagApiKey } from "stores/createFeatureFlagSlice";

import type { ErrorWithResponse } from "./error";
import handleError from "./error";
import type { ApiOpts } from "./types";

// Reads each FeatureFlag from the API's Flipper flags by its key (client_<name> or
// client_install_<name>, per its scope). Flags the app doesn't define, and non-boolean values,
// are dropped
const fetchFeatureFlags = async (
  opts: ApiOpts = {},
): Promise<Partial<Record<FeatureFlag, boolean>>> => {
  try {
    // The response is cacheable for 60s but varies by token, so a fetch right after
    // login/logout could get the other auth state's flags from the HTTP cache
    const { flags } = await inatjs.feature_flags.get( {}, {
      ...opts,
      headers: { "Cache-Control": "no-cache" },
    } );
    const values: Partial<Record<FeatureFlag, boolean>> = {};
    Object.values( FeatureFlag ).forEach( featureFlag => {
      const value = flags?.[featureFlagApiKey( featureFlag )];
      if ( typeof value === "boolean" ) {
        values[featureFlag] = value;
      }
    } );
    return values;
  } catch ( e ) {
    // handleError throws unless passed `throw: false`
    throw await handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchFeatureFlags" } },
    );
  }
};

export default fetchFeatureFlags;
