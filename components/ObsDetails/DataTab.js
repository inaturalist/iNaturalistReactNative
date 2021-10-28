// @flow

import * as React from "react";
import { View, Text } from "react-native";

import { textStyles, viewStyles } from "../../styles/obsDetails";

type Props = {
  observation: Object
}

const DataTab = ( { observation }: Props ): React.Node => (
  <View>
    {console.log( observation, "obs" )}
    <Text>{observation.description}</Text>
    <Text>{observation.latitude}</Text>
    <Text>{observation.longitude}</Text>
    <Text>{observation.location}</Text>
    <Text>{observation.timeObservedAt}</Text>
    <Text>{observation.createdAt}</Text>
  </View>
);

export default DataTab;
