import { useNavigation } from "@react-navigation/native";
import {
  ActivityIndicator,
  Body1,
  Button,
  Heading1,
  INatIcon,
  ProjectListItem,
  SearchBar,
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React, { useEffect } from "react";
import {
  FlatList
} from "react-native";
import {
  useTranslation
} from "sharedHooks";

interface Props {
  searchInput: string;
  setSearchInput: Function,
  tabs: Object[],
  currentTabId: string;
  projects: Object[],
  isLoading: boolean;
  memberId?: number;
}

const Projects = ( {
  searchInput, setSearchInput, tabs, currentTabId, projects, isLoading, memberId
}: Props ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  useEffect( ( ) => {
    const headerLeft = ( ) => (
      <>
        <INatIcon
          name="briefcase"
          size={25}
        />
        <Heading1 className="pl-2 pt-1">{t( "Projects" )}</Heading1>
      </>
    );

    navigation.setOptions( {
      headerLeft
    } );
  }, [navigation, t] );

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

  const renderEmptyList = ( ) => {
    if ( isLoading ) {
      <ActivityIndicator size={50} />;
    } else {
      return (
        <>
          <Body1 className="self-center">{t( "No-projects-match-that-search" )}</Body1>
          <View className="w-full px-4 mt-5">
            <Button
              level="neutral"
              text={t( "RESET-SEARCH" )}
              onPress={( ) => setSearchInput( "" )}
            />
          </View>
        </>
      );
    }

    if ( searchInput.length === 0 ) {
      if ( currentTabId === "JOINED" && !memberId ) {
        return (
          <View className="items-center">
            <Body1>{t( "You-havent-joined-any-projects-yet" )}</Body1>
            <Body1 className="mt-5">{t( "You-can-click-join-on-the-project-page" )}</Body1>
          </View>
        );
      }
    }

    return null;
  };

  const emptyListStyles = {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center"
  };

  return (
    <ViewWrapper testID="Projects">
      <View className="py-5 mx-4">
        <SearchBar
          handleTextChange={setSearchInput}
          value={searchInput}
          testID="ProjectSearch.input"
          placeholder={t( "Search-for-a-project" )}
          clearSearch={( ) => setSearchInput( "" )}
        />
      </View>
      {searchInput.length === 0 && (
        <>
          <Tabs tabs={tabs} activeId={currentTabId} />
          <View className="mb-3" />
        </>
      )}
      <FlatList
        contentContainerStyle={projects?.length === 0 && emptyListStyles}
        data={projects}
        renderItem={renderProject}
        testID="Project.list"
        ListEmptyComponent={renderEmptyList}
      />
    </ViewWrapper>
  );
};

export default Projects;
