// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderBackButton } from "@react-navigation/elements";

import Projects from "../components/Projects/Projects";
import ProjectDetails from "../components/Projects/ProjectDetails";

const Stack = createNativeStackNavigator( );

const screenOptions = {
  headerShown: true
};

const headerLeftComponent = navigation => <HeaderBackButton onPress={( ) => navigation.goBack( )} />;

const ProjectsStackNavigation = ( ): React.Node => (
  <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Projects"
        component={Projects}
      />
      <Stack.Screen
        name="ProjectDetails"
        component={ProjectDetails}
        options={( { navigation } ) => ( {
          headerLeft: headerLeftComponent( navigation )
        } )}
      />
  </Stack.Navigator>
);

export default ProjectsStackNavigation;
