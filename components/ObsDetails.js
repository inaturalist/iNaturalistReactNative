// @flow


import React from "react";
import { Text } from "react-native";
import type { Node } from "react";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";
import { ScrollView } from "react-native-gesture-handler";

const ObsDetails = ( ): Node => (
  <ViewWithFooter>
    <ScrollView>
    <Text>username</Text>
    <Text>observation date</Text>
    <Text>observation photos, including faved observations & copywrite info</Text>
    <Text>default photo</Text>
    <Text>species card: rank, common name, sci name, same right hand side as obslist</Text>
    <Text>username</Text>
    <Text>location of obs</Text>
    <Text>two tabs: activity, data</Text>
    <Text>activity: username, computervision, leading/improving, time since comment</Text>
    <Text>default photo with common name/name</Text>
    <Text>comments</Text>
    <Text>agree button</Text>
    <Text>data: description, location map, date observed, date uploaded</Text>
    <Text>data: projects, annotations, obs fields, obs created using, copyright</Text>
    </ScrollView>
  </ViewWithFooter>
);

export default ObsDetails;
