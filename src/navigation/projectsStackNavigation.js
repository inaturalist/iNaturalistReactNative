// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
// import { useMemo } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";

import ProjectDetails from "../components/Projects/ProjectDetails";
import Projects from "../components/Projects/Projects";

const Stack = createNativeStackNavigator( );

const screenOptions = {
  headerShown: true
};

const BackButton = ( ) => {
  const navigation = useNavigation( );
  return ( <HeaderBackButton onPress={( ) => navigation.goBack( )} /> );
};

const ProjectsStackNavigation = ( ): React.Node => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="Projects"
      component={Projects}
    />
    <Stack.Screen
      name="ProjectDetails"
      component={ProjectDetails}
      options={{ headerLeft: BackButton }}
    />
  </Stack.Navigator>
);

export default ProjectsStackNavigation;
