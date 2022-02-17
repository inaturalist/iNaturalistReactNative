// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// TODO import { HeaderBackButton } from "@react-navigation/elements";

import Messages from "../components/Messages/Messages";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: true
};

// TODO const showBackButton = ( { navigation } ) => ( {
//   headerLeft: ( ) => <HeaderBackButton onPress={( ) => navigation.goBack( )} />
// } );

const MessagesStackNavigation = (): React.Node => (
  // Provider needs to wrap the whole navigator, because a navigator can't have a
  // provider as its child
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="Messages"
      component={Messages}
    // options={( { navigation } ) => ( {
    //   headerRight: ( ) => <MessagesIcon />
    // } )}
    />
    {/* <Stack.Screen
          name="ObsDetails"
          component={ObsDetails}
          options={showBackButton}
          /> */}
  </Stack.Navigator>
);

export default MessagesStackNavigation;
