// @flow

import React, { useState } from "react";
import { Text, Pressable } from "react-native";
import type { Node } from "react";

import { textStyles } from "../../styles/explore/explore";
import InputField from "../SharedComponents/InputField";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";

const Explore = ( ): Node => {
  const [searchTerm, setSearchTerm] = useState( "" );
  const [location, setLocation] = useState( "" );
  const search = input => setSearchTerm( input );
  const updateLocation = input => setLocation( input );

  return (
    <ViewWithFooter>
      <Text style={textStyles.explanation}>search for species and taxa seen anywhere in the world</Text>
      <Text style={textStyles.explanation}>try searching for insects near your location...</Text>
      <InputField
        handleTextChange={search}
        placeholder="search bar"
        text={searchTerm}
        type="none"
      />
      <InputField
        handleTextChange={updateLocation}
        placeholder="location bar"
        text={location}
        type="none"
      />
      <Pressable>
        <Text>Explore organisms</Text>
      </Pressable>
    </ViewWithFooter>
  );
};

export default Explore;
