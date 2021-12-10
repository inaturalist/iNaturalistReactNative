// @flow

import * as React from "react";
import { View, Text } from "react-native";

// import { textStyles, viewStyles } from "../../styles/obsDetails";
import Map from "../SharedComponents/Map";

type Props = {
  observation: Object
}

const DataTab = ( { observation }: Props ): React.Node => (
  <View>
    <Text>Notes</Text>
    <Text>{observation.description}</Text>
    <Map
      obsLatitude={observation.latitude}
      obsLongitude={observation.longitude}
      mapHeight={150}
    />
    <Text>{observation.placeGuess}</Text>
    <Text>Date</Text>
    <Text>{`date observed ${observation.timeObservedAt}`}</Text>
    <Text>{`date uploaded ${observation.createdAt}`}</Text>
    <Text>Projects</Text>
    <Text>Annotations</Text>
    <Text>Obs Fields</Text>
    <Text>Obs Created Using</Text>
    <Text>Copyright</Text>
  </View>
);

export default DataTab;
