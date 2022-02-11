// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// TODO import { HeaderBackButton } from "@react-navigation/elements";

import Messages from "../components/Messages/Messages";
// TODO import ObsDetails from "../components/ObsDetails/ObsDetails";
import MessageProvider from "../providers/MessageProvider";

const Stack = createNativeStackNavigator( );

const screenOptions = {
  headerShown: true
};

// TODO const showBackButton = ( { navigation } ) => ( {
//   headerLeft: ( ) => <HeaderBackButton onPress={( ) => navigation.goBack( )} />
// } );

const MessagesStackNavigation = ( ): React.Node => (
  // Provider needs to wrap the whole navigator, because a navigator can't have a
  // provider as its child
  <MessageProvider>
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
  </MessageProvider>
);

export default MessagesStackNavigation;
