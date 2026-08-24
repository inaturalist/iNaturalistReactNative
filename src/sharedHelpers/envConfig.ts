import Config from "react-native-config";
import { getActiveEnvironment } from "sharedHelpers/installData";

// Add a new prefix here (and the matching <PREFIX>_* vars in .env) to make
// another baked-in environment selectable from the Developer screen.
export const ENVIRONMENTS = ["STAGING", "STAGING_LITE"];

const RUNTIME_ENV_KEYS = [
  "API_URL",
  "OAUTH_API_URL",
  "JWT_ANONYMOUS_API_SECRET",
  "OAUTH_CLIENT_ID",
  "OAUTH_CLIENT_SECRET",
  "GOOGLE_WEB_CLIENT_ID",
  "GOOGLE_IOS_CLIENT_ID",
] as const;

type RuntimeEnvKey = typeof RUNTIME_ENV_KEYS[number];

// Only offer environments in the Developer screen whose full set of
// prefixed vars is actually baked into this build
export function getAvailableEnvironments(): string[] {
  return ENVIRONMENTS.filter( prefix => RUNTIME_ENV_KEYS.every(
    key => !!Config[`${prefix}_${key}`],
  ) );
}

function resolveEnvValue( key: RuntimeEnvKey ): string | undefined {
  const activePrefix = getActiveEnvironment();
  if ( !activePrefix ) return Config[key];
  return Config[`${activePrefix}_${key}`] || Config[key];
}

// Computed once when the JS bundle loads. Every environment switch ends in
// RNRestart.restart(), which re-evaluates this module, so it's safe to
// resolve these once here rather than read them dynamically everywhere.
export const EnvConfig = RUNTIME_ENV_KEYS.reduce( ( acc, key ) => {
  acc[key] = resolveEnvValue( key );
  return acc;
}, {} as Record<RuntimeEnvKey, string | undefined> );
