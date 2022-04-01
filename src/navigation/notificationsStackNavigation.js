// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderBackButton } from "@react-navigation/elements";

import Messages from "../components/Messages/Messages";
import MessageDetails from "../components/Messages/MessageDetails";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: true
};

const showBackButton = ( { navigation } ) => ( {
  headerLeft: ( ) => <HeaderBackButton onPress={( ) => navigation.goBack( )} />
} );

const NotificationsStackNavigation = (): React.Node => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="Messages"
      component={Messages}
    />
    <Stack.Screen
      name="MessageDetails"
      component={MessageDetails}
      options={showBackButton}
    />
  </Stack.Navigator>
);

export default NotificationsStackNavigation;
