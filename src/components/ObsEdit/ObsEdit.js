// @flow

import * as React from "react";
import { Text } from "react-native";
import { useRoute } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";

const ObsEdit = ( ): React.Node => {
  const { params } = useRoute( );
  const { photo } = params;
  console.log( photo, "photo in obs edit" );

  return (
    <ViewWithFooter>
      <Text>observation edit screen</Text>
    </ViewWithFooter>
  );
};

export default ObsEdit;
