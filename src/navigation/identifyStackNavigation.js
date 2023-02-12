// @flow

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Identify from "components/Identify/Identify";
import { t } from "i18next";
import { showHeader } from "navigation/navigationOptions";
import * as React from "react";

import {
  IDENTIFY_NAME
} from "./navigationIds";

const Stack = createNativeStackNavigator( );

const IdentifyStackNavigation = ( ): React.Node => (
  <Stack.Navigator screenOptions={showHeader}>
    <Stack.Screen
      name={IDENTIFY_NAME}
      component={Identify}
      options={{ headerTitle: t( "Identify" ) }}
    />
  </Stack.Navigator>
);

export default IdentifyStackNavigation;
