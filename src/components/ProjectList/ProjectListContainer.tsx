import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useEffect } from "react";

import ProjectList from "./ProjectList";

const ProjectListContainer = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { projects, headerOptions } = params;

  useEffect( ( ) => {
    navigation.setOptions( headerOptions );
  }, [headerOptions, navigation] );

  return (
    <ViewWrapper>
      <View className="border-b border-lightGray mt-5" />
      <ProjectList projects={projects} />
    </ViewWrapper>
  );
};

export default ProjectListContainer;
