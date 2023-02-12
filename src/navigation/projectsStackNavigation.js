// @flow

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProjectDetails from "components/Projects/ProjectDetails";
import Projects from "components/Projects/Projects";
import { t } from "i18next";
import { showHeader } from "navigation/navigationOptions";
import * as React from "react";

import {
  PROJECT_DETAILS_NAME,
  PROJECT_NAME
} from "./navigationIds";

const Stack = createNativeStackNavigator( );

const ProjectsStackNavigation = ( ): React.Node => (
  <Stack.Navigator screenOptions={showHeader}>
    <Stack.Screen
      name={PROJECT_NAME}
      component={Projects}
      options={{ headerTitle: t( "Projects" ) }}
    />
    <Stack.Screen
      name={PROJECT_DETAILS_NAME}
      component={ProjectDetails}
      options={{ headerTitle: t( "Project" ) }}
    />
  </Stack.Navigator>
);

export default ProjectsStackNavigation;
