// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProjectDetailsContainer from "components/ProjectDetails/ProjectDetailsContainer";
import ProjectsContainer from "components/Projects/ProjectsContainer";
import {
  blankHeaderTitle,
  removeBottomBorder,
  showHeaderLeft
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

const Stack = createNativeStackNavigator( );

const ProjectsStackNavigator = ( ): Node => (
  <Stack.Navigator>
    <Stack.Screen
      name="Projects"
      component={ProjectsContainer}
      options={{
        ...removeBottomBorder,
        ...blankHeaderTitle
      }}
    />
    <Stack.Screen
      name="ProjectDetails"
      component={ProjectDetailsContainer}
      options={{
        ...blankHeaderTitle,
        ...removeBottomBorder,
        ...showHeaderLeft
      }}
    />
  </Stack.Navigator>
);

export default ProjectsStackNavigator;
