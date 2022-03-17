// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Messages from "../components/Messages/Messages";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: true
};

const NotificationsStackNavigation = (): React.Node => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="Messages"
      component={Messages}
    />
    {/* TODO: <Stack.Screen
          name="MessageDetails"
          component={...}
          options={showBackButton}
          /> */}
  </Stack.Navigator>
);

export default NotificationsStackNavigation;
