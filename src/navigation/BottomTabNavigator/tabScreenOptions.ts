import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

// Note: this file exists so we can mock the screenOptions and disable animations while under test.
// If you update this file, be sure to update the mock in tests/jest.setup.js as well.
const tabScreenOptions: BottomTabNavigationOptions = {
  lazy: true,
  freezeOnBlur: true,
  headerShown: false,
  animation: "fade",
};

export default tabScreenOptions;
