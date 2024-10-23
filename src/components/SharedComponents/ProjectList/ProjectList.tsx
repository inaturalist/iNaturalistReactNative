import { useNavigation, useRoute } from "@react-navigation/native";
import {
  CustomFlashList,
  ProjectListItem,
  ViewWrapper
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React, { useEffect } from "react";
import {
  useTranslation
} from "sharedHooks";

const ProjectList = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { projects, headerOptions } = params;
  const { t } = useTranslation( );

  useEffect( ( ) => {
    navigation.setOptions( headerOptions );
  }, [headerOptions, navigation] );

  const renderProject = ( { item: project } ) => (
    <Pressable
      className="px-4 py-1.5"
      onPress={( ) => navigation.navigate( "ProjectDetails", { id: project.id } )}
      testID={`Project.${project.id}`}
      accessible
      accessibilityRole="button"
      accessibilityLabel={t( "Navigates-to-project-details" )}
    >
      <ProjectListItem item={project} />
    </Pressable>
  );

  const renderItemSeparator = () => (
    <View className="border-b border-lightGray" />
  );

  return (
    <ViewWrapper>
      <View className="border-b border-lightGray mt-5" />
      <CustomFlashList
        ItemSeparatorComponent={renderItemSeparator}
        data={projects}
        estimatedItemSize={100}
        renderItem={renderProject}
        testID="ProjectList"
      />
    </ViewWrapper>
  );
};

export default ProjectList;
