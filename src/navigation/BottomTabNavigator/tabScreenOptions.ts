import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

const tabScreenOptions: BottomTabNavigationOptions = {
  lazy: true,
  freezeOnBlur: true,
  headerShown: false,
  animation: "fade",
};

export default tabScreenOptions;
