// @flow

import * as React from "react";
import { Text, Pressable } from "react-native";
import { textStyles } from "../../styles/explore/explore";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";

const Explore = ( ): React.Node => (
  <ViewWithFooter>
    <Text style={textStyles.explanation}>search for species and taxa seen anywhere in the world</Text>
    <Text style={textStyles.explanation}>try searching for insects near your location...</Text>
    <Text>search bar one</Text>
    <Text>my location</Text>
    <Pressable>
      <Text>Explore organisms</Text>
    </Pressable>
  </ViewWithFooter>
);

export default Explore;
