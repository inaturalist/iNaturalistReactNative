// FeatureFlag: used to toggle a feature on or off during development,
// allowing us to ship in progress code and turn it on for testing
// it in a certain build of the app.
// Associated Feature is expected to be eventually be turned on by default,
// and then eventually remove the FeatureFlag and "any old" code.
export enum FeatureFlag {
  // flags should use positive language ending with `Enabled`
  // MyFeatureFlagEnabled = "myFeatureFlagEnabled",
  ExploreV2Enabled = "exploreV2Enabled",
}

// DevOnlyFlag: similar to FeatureFlag allowing us to toggle app
// behavior in development, but not intended to be exposed to end users.
// Associated flag and code is expected to remain unless it no longer makes sense.
export enum DevOnlyFlag {
  // flags should use positive language ending with `Enabled`
  // MyDevOnlyFlagEnabled = "myDevOnlyFlagEnabled",
  SimulateAirplaneModeEnabled = "simulateAirplaneMode",
}

export type DynamicConfigItem = FeatureFlag | DevOnlyFlag;
