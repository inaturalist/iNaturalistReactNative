import ProjectListItem from "components/ProjectList/ProjectListItem";
import {
  Body1,
  Body2,
  CustomFlashList,
  INatIcon,
} from "components/SharedComponents";
import { SharedStackBottomInsetViewWrapper } from "components/SharedComponents/ViewWrapper";
import { Pressable, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ListRenderItem } from "react-native";
import Project from "realmModels/Project";
import type { RealmProject } from "realmModels/types";
import colors from "styles/tailwindColors";

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
  const [selectedProjectIds, setSelectedProjectIds] = useState( () => new Set( ) );

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

  const toggleProject = useCallback( ( projectId: number ) => {
    setSelectedProjectIds( previousSelectedProjectIds => {
      const nextSelectedProjectIds = new Set( previousSelectedProjectIds );
      if ( nextSelectedProjectIds.has( projectId ) ) {
        nextSelectedProjectIds.delete( projectId );
      } else {
        nextSelectedProjectIds.add( projectId );
      }
      return nextSelectedProjectIds;
    } );
  }, [] );

  const renderRightIcon = ( isSelected: boolean ) => {
    if ( isSelected ) {
      return (
        <INatIcon name="circle-dots-pencil" color={colors.darkGray} size={24} />
      );
    }
    return (
      <INatIcon name="circle" color={colors.darkGray} size={24} />
    );
  };

  const renderProject: ListRenderItem<RealmProject> = useCallback(
    ( { item } ) => {
      const isSelected = selectedProjectIds.has( item.id );

      return (
        <Pressable
          className="flex-row items-center px-4 py-2"
          onPress={() => toggleProject( item.id )}
          testID={`AddToProjects.project.${item.id}`}
          accessible
          accessibilityRole="switch"
          accessibilityState={{ checked: isSelected }}
          accessibilityLabel={item.title || undefined}
        >
          <View className="flex-1 mr-2.5">
            <ProjectListItem item={item} />
          </View>
          {renderRightIcon( isSelected )}
        </Pressable>
      );
    },
    [selectedProjectIds, toggleProject],
  );

  return (
    <SharedStackBottomInsetViewWrapper testID="add-to-projects">
      <CustomFlashList
        testID="AddToProjects.list"
        ListEmptyComponent={listEmptyComponent}
        ListHeaderComponent={listHeaderComponent}
        ListFooterComponent={listFooterComponent}
        data={joinedProjects}
        keyExtractor={( project: RealmProject ) => String( project.id )}
        renderItem={renderProject}
        ItemSeparatorComponent={ItemSeparator}
        // extraData={selectedProjectIds}
      />
    </SharedStackBottomInsetViewWrapper>
  );
};

export default AddToProjects;
