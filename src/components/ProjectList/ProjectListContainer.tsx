import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body1,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "sharedHooks";

import ProjectList from "./ProjectList";

const ProjectListContainer = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { projects, headerOptions } = params;
  const { t } = useTranslation( );

  useEffect( ( ) => {
    navigation.setOptions( headerOptions );
  }, [headerOptions, navigation] );

  const renderEmptyComponent = useCallback( ( ) => (
    <View className="self-center mt-5 p-4">
      <Body1 className="align-center text-center">
        {t( "This-user-has-not-joined-any-projects" )}
      </Body1>
    </View>
  ), [t] );

  return (
    <ViewWrapper>
      <View className="border-b border-lightGray mt-5" />
      <ProjectList
        projects={projects}
        ListEmptyComponent={renderEmptyComponent}
      />
    </ViewWrapper>
  );
};

export default ProjectListContainer;
