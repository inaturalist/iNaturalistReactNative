import type { ProjectRulePreference } from "api/types";
import ProjectListItem from "components/ProjectList/ProjectListItem";
import {
  Body1,
  Body2,
  CustomFlashList,
} from "components/SharedComponents";
import { SharedStackBottomInsetViewWrapper } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ListRenderItem } from "react-native";
import Project from "realmModels/Project";

const { useQuery } = RealmContext;

const ItemSeparator = ( ) => <View className="border-b border-lightGray" />;

const AddToProjects = ( ) => {
  const { t } = useTranslation( );
  const joinedProjectsCollection = useQuery(
    {
      type: Project,
      query: projects => projects
      // \"\" project type for traditional projects is an empty string
        .filtered( "project_type == \"\" OR project_type == null" ),
    },
    [],
  );

  const joinedProjects = useMemo(
    () => joinedProjectsCollection.map( jp => Project.mapRealmToPojo( jp ) ),
    [joinedProjectsCollection],
  );

  const listHeaderComponent = useMemo(
    ( ) => (
      <View className="px-4 pt-5 pb-6">
        <Body1>{t( "Traditional-Projects" )}</Body1>
        <Body2 className="mt-2">
          {t(
            "You-can-manually-add-observations-to-Traditional-Projects-you-have-joined",
          )}
        </Body2>
      </View>
    ),
    [t],
  );

  const listEmptyComponent = useMemo(
    ( ) => (
      <View className="px-20 items-center">
        <Body1 className="text-center">
          {t( "You-havent-joined-any-Traditional-Projects-yet" )}
        </Body1>
      </View>
    ),
    [t],
  );

  const listFooterComponent = useMemo(
    () => (
      <View className="px-4 pt-6 pb-6">
        <Body1>{t( "Collection-and-Umbrella-Projects" )}</Body1>
        <Body2 className="mt-2">
          {t(
            "For-most-other-projects-observations-will-automatically-be-included",
          )}
        </Body2>
        <Body2 className="mt-4">
          {t( "You-cant-add-or-remove-observations-from-collection-and-umbrella-projects" )}
        </Body2>
        <Body2 className="mt-4">
          {t( "To-view-this-observations-Collection-and-Umbrella-Projects" )}
        </Body2>
      </View>
    ),
    [t],
  );

  interface Project {
    icon: string;
    id: number;
    project_type: "collection" | "umbrella" | "";
    rule_preferences: ProjectRulePreference[];
    title: string;
  }
  const renderProject: ListRenderItem<Project> = useCallback(
    ( { item } ) => (
      <View className="px-4 py-2">
        <ProjectListItem item={item} />
      </View>
    ),
    [],
  );

  return (
    <SharedStackBottomInsetViewWrapper testID="add-to-projects">
      <CustomFlashList
        testID="AddToProjects.list"
        ListEmptyComponent={listEmptyComponent}
        ListHeaderComponent={listHeaderComponent}
        ListFooterComponent={listFooterComponent}
        data={joinedProjects}
        keyExtractor={( project: Project ) => String( project.id )}
        renderItem={renderProject}
        ItemSeparatorComponent={ItemSeparator}
      />
    </SharedStackBottomInsetViewWrapper>
  );
};

export default AddToProjects;
