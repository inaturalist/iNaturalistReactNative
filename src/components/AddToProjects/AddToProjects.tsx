import { useNavigation } from "@react-navigation/native";
import ProjectListItem from "components/ProjectList/ProjectListItem";
import {
  Body1,
  Body2,
  Body3,
  Button,
  ButtonBar,
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
import type { RealmProject, RealmProjectObservation } from "realmModels/types";
import useStore from "stores/useStore";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const { useQuery } = RealmContext;

const DROP_SHADOW = getShadow( {
  offsetHeight: -3,
  shadowOpacity: 0.2,
} );

const ItemSeparator = ( ) => <View className="border-b border-lightGray" />;

const AddToProjects = ( ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const joinedProjectsCollection = useQuery(
    {
      type: Project,
      query: projects => projects
      // \"\" project type for traditional projects is an empty string
        .filtered( "project_type == \"\" OR project_type == null" ),
    },
    [],
  );
  const projectObservations = useStore(
    state => state.currentObservation?.projectObservations,
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

  const onSave = ( ) => {
    navigation.goBack( );
  };
  const disabled = false;

  const renderExpanded = useCallback(
    ( item: RealmProject ) => {
      console.log( item );
      return (
        <View className="bg-lightGrayOpaque">
          {Math.random() > 0.5
            ? (
              <View className="px-4 py-2.5 flex-row justify-center items-center">
                <INatIcon
                  name="triangle-exclamation"
                  color={colors.warningRed}
                  size={19}
                />
                <Body3 className="ml-2.5">
                  {t( "To-add-to-this-project-all-required-fields-must-be-filled" )}
                </Body3>
              </View>
            )
            : (
              <View className="px-4 py-2.5 flex-row justify-center items-center">
                <INatIcon
                  name="checkmark-circle"
                  color={colors.inatGreen}
                  size={19}
                />
                <Body3 className="ml-2.5">
                  {t( "All-required-fields-have-been-filled" )}
                </Body3>
              </View>
            )}
          {item.projectObservationFields.map( pof => (
            <Body1>{pof.obsField?.name}</Body1>
          ) )}
        </View>
      );
    },
    [t],
  );

  const renderRightIcon = useCallback(
    ( item: RealmProject, isSelected: boolean ) => {
      // Logic if all required fields have been filled out will live in zustand
      if (
        projectObservations?.some(
          ( po: RealmProjectObservation ) => po.projectId === item.id,
        )
      ) {
        return (
          <INatIcon name="checkmark-circle" color={colors.darkGray} size={24} />
        );
      }
      if ( isSelected ) {
        return (
          <INatIcon
            name="circle-dots-pencil"
            color={colors.darkGray}
            size={24}
          />
        );
      }
      return <INatIcon name="circle" color={colors.darkGray} size={24} />;
    },
    [projectObservations],
  );

  const renderProject: ListRenderItem<RealmProject> = useCallback(
    ( { item } ) => {
      const isSelected = selectedProjectIds.has( item.id );

      return (
        <View>
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
            {renderRightIcon( item, isSelected )}
          </Pressable>
          {isSelected && renderExpanded( item )}
        </View>
      );
    },
    [renderExpanded, renderRightIcon, selectedProjectIds, toggleProject],
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
      />
      <View
        className="bg-white"
        style={DROP_SHADOW}
      >
        <ButtonBar>
          <Button
            testID="AddToProjects.saveButton"
            maxFontSizeMultiplier={1}
            text={t( "SAVE" )}
            onPress={onSave}
            level="neutral"
            disabled={disabled}
          />
        </ButtonBar>
      </View>
    </SharedStackBottomInsetViewWrapper>
  );
};

export default AddToProjects;
