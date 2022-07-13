// @flow

import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import {
  FlatList, Image, Pressable, Text
} from "react-native";

import { imageStyles, textStyles, viewStyles } from "../../styles/projects/projects";

type Props = {
  data: Array<Object>
}

const ProjectList = ( { data }: Props ): React.Node => {
  const navigation = useNavigation( );

  const renderProjects = ( { item } ) => {
    const navToProjectDetails = ( ) => navigation.navigate( "ProjectDetails", { id: item.id } );
    return (
      <Pressable
        onPress={navToProjectDetails}
        style={viewStyles.row}
        testID={`Project.${item.id}`}
      >
        <Image
          source={{ uri: item.icon }}
          style={imageStyles.projectIcon}
          testID={`Project.${item.id}.photo`}
        />
        <Text style={textStyles.projectName}>{item.title}</Text>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderProjects}
      testID="Project.list"
    />
  );
};

export default ProjectList;
