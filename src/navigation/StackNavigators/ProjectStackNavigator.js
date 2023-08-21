// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProjectDetails from "components/Projects/ProjectDetails";
import Projects from "components/Projects/Projects";
import { t } from "i18next";
import {
  blankHeaderTitle,
  removeBottomBorder,
  showHeaderLeft
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

const Stack = createNativeStackNavigator( );

const ProjectStackNavigator = ( ): Node => (
  <Stack.Navigator>
    <Stack.Group>
      <Stack.Screen
        name="Projects"
        component={Projects}
        options={{
          ...removeBottomBorder,
          headerTitle: t( "Projects" )
        }}
      />
      <Stack.Screen
        name="ProjectDetails"
        component={ProjectDetails}
        options={{
          ...blankHeaderTitle,
          ...removeBottomBorder,
          ...showHeaderLeft
        }}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default ProjectStackNavigator;
