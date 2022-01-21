// @flow

import * as React from "react";
import { FlatList, Pressable, Text, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { imageStyles, viewStyles, textStyles } from "../../styles/projects/projects";

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
        <Text style={textStyles.projectName}>{item.id}</Text>
        <Image source={{ uri: item.icon }} style={imageStyles.projectIcon} testID={`Project.${item.id}.photo`}/>
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

