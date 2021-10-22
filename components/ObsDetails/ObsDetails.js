// @flow


import React from "react";
import { Text, View, Image } from "react-native";
import type { Node } from "react";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ScrollView } from "react-native-gesture-handler";
import { useRoute } from "@react-navigation/core";

import { viewStyles, textStyles, imageStyles } from "../../styles/obsDetails";
import useFetchObsDetails from "./hooks/fetchObsDetails";

const ObsDetails = ( ): Node => {
  const comments = useFetchObsDetails( );
  const { params } = useRoute( );
  const observation = params.observation;
  console.log( comments, "cmoments in obs detail" );
  return (
    <ViewWithFooter>
      <ScrollView>
      <View style={viewStyles.userProfileRow}>
        <View style={viewStyles.userProfileRow}>
          <Image source={{ uri: observation.userProfilePhoto }} style={imageStyles.userProfileIcon} />
          <Text>{`@${observation.userLogin}`}</Text>
        </View>
        <Text>{observation.createdAt}</Text>
      </View>
      <View style={viewStyles.photoContainer}>
        <Text>observation photos, including faved observations & copywrite info</Text>
      </View>
      <View style={viewStyles.row}>
        <Image source={{ uri: observation.userPhoto }} style={viewStyles.imageBackground} />
        <View style={viewStyles.obsDetailsColumn}>
          <Text style={textStyles.text}>{observation.taxonRank}</Text>
          <Text style={textStyles.text}>{observation.commonName}</Text>
          <Text style={textStyles.text}>scientific name</Text>
        </View>
        <View>
          <Text style={textStyles.text}>{observation.identificationCount}</Text>
          <Text style={textStyles.text}>{observation.commentCount}</Text>
          <Text style={textStyles.text}>{observation.qualityGrade}</Text>
        </View>
      </View>
      <Text>{observation.location}</Text>
      <View style={viewStyles.userProfileRow}>
        <Text>ACTIVITY</Text>
        <Text>DATA</Text>
      </View>
      <Text>activity: username, computervision, leading/improving, time since comment</Text>
      <Text>default photo name</Text>
      <Text>{observation.commonName}</Text>
      <Text>comments</Text>
      <Text>agree button</Text>
      <Text>{observation.timeObservedAt}</Text>
      <Text>data: description, location map, date observed, date uploaded</Text>
      <Text>data: projects, annotations, obs fields, obs created using, copyright</Text>
      <Text>comment (edit)</Text>
      <Text>suggest id (edit)</Text>
      </ScrollView>
    </ViewWithFooter>
  );
};

export default ObsDetails;
