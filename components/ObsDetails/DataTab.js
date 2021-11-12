// @flow

import * as React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

// import { textStyles, viewStyles } from "../../styles/obsDetails";
import Map from "../SharedComponents/Map";

type Props = {
  observation: Object
}

const DataTab = ( { observation }: Props ): React.Node => {
  const { t } = useTranslation( );

  return (
    <View>
      <Text>Notes</Text>
      <Text>{observation.description}</Text>
      <Map latitude={observation.latitude} longitude={observation.longitude} />
      <Text>{observation.placeGuess}</Text>
      <Text>Date</Text>
      <Text>{t( "date_observed", { date: observation.timeObservedAt } )}</Text>
      <Text>{t( "date_uploaded", { date: observation.createdAt } )}</Text>
      {/* <Text>{`date observed ${observation.timeObservedAt}`}</Text>
      <Text>{`date uploaded ${observation.createdAt}`}</Text> */}
      <Text>Projects</Text>
      <Text>Annotations</Text>
      <Text>Obs Fields</Text>
      <Text>Obs Created Using</Text>
      <Text>Copyright</Text>
    </View>
  );
};

export default DataTab;
