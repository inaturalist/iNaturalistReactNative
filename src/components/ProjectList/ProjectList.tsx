import { useNavigation } from "@react-navigation/native";
import type { ApiProjectSummary } from "api/types";
import {
  CustomFlashList,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import {
  useTranslation,
} from "sharedHooks";

import ProjectListItem from "./ProjectListItem";

const ItemSeparator = () => <View className="border-b border-lightGray" />;

interface Props {
  projects: ApiProjectSummary[];
  ListEmptyComponent?: React.ReactElement | null;
  ListFooterComponent?: React.ReactElement;
  onEndReached?: ( ) => void;
  onPress?: ( project: ApiProjectSummary ) => void;
  accessibilityLabel?: string;
}

const ProjectList = ( {
  projects,
  ListEmptyComponent,
  ListFooterComponent,
  onEndReached,
  onPress,
  accessibilityLabel,
}: Props ) => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const renderProject = ( { item: project }: { item: ApiProjectSummary } ) => (
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

  return (
    <CustomFlashList
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      data={projects}
      keyExtractor={( item: ApiProjectSummary ) => item.id}
      onEndReached={onEndReached}
      renderItem={renderProject}
      testID="ProjectList"
    />
  );
};

export default ProjectList;
