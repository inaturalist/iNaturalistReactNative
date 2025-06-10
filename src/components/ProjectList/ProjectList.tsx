import { useNavigation } from "@react-navigation/native";
import type { ApiProject } from "api/types";
import {
  CustomFlashList
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import {
  useTranslation
} from "sharedHooks";

import ProjectListItem from "./ProjectListItem";

interface Props {
  projects: Array<object>
  ListEmptyComponent?: React.JSX.Element
  ListFooterComponent?: React.JSX.Element
  onEndReached?: ( ) => void
  onPress?: ( project: ApiProject ) => void
  accessibilityLabel?: string
}

const ProjectList = ( {
  projects,
  ListEmptyComponent,
  ListFooterComponent,
  onEndReached,
  onPress,
  accessibilityLabel
}: Props ) => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const renderProject = ( { item: project }: { item: ApiProject } ) => (
    <Pressable
      className="px-4 py-1.5"
      onPress={( ) => {
        if ( onPress ) {
          onPress( project );
        } else {
          navigation.navigate( "ProjectDetails", { id: project.id } );
        }
      }}
      testID={`Project.${project.id}`}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || t( "Navigates-to-project-details" )}
    >
      <ProjectListItem item={project} />
    </Pressable>
  );

  const renderItemSeparator = () => (
    <View className="border-b border-lightGray" />
  );

  return (
    <CustomFlashList
      ItemSeparatorComponent={renderItemSeparator}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      data={projects}
      estimatedItemSize={100}
      keyExtractor={item => item.id}
      onEndReached={onEndReached}
      renderItem={renderProject}
      testID="ProjectList"
    />
  );
};

export default ProjectList;
