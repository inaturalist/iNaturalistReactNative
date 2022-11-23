// @flow

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProjectDetails from "components/Projects/ProjectDetails";
import Projects from "components/Projects/Projects";
import { t } from "i18next";
import { showHeader } from "navigation/navigationOptions";
import * as React from "react";

const Stack = createNativeStackNavigator( );

const ProjectsStackNavigation = ( ): React.Node => (
  <Stack.Navigator screenOptions={showHeader}>
    <Stack.Screen
      name="Projects"
      component={Projects}
      options={{ headerTitle: t( "Projects" ) }}
    />
    <Stack.Screen
      name="ProjectDetails"
      component={ProjectDetails}
      options={{ headerTitle: t( "Project" ) }}
    />
  </Stack.Navigator>
);

export default ProjectsStackNavigation;
