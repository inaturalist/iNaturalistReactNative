import { useNavigation } from "@react-navigation/native";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text
} from "react-native";

import useRepository from "./useRepository";

const Observations = ( ) => {
  const [observations, setObservations] = useState( [] );
  const repo = useRepository( "Observation" );
  const navigation = useNavigation( );

  useEffect( ( ) => {
    const queryObservations = async ( ) => {
      setObservations( await repo.search( ) );
    };
    if ( repo ) queryObservations( );
  }, [repo] );

  if ( !repo ) {
    return <ActivityIndicator />;
  }

  return (
    <ViewWithFooter>
      { /* eslint-disable-next-line i18next/no-literal-string */ }
      <Text>Some Observations</Text>
      { observations.map( o => (
        <Pressable
          key={o.uuid}
          onPress={() => navigation.navigate( "RepositoryTestDetail", { uuid: o.uuid } )}
        >
          <Image
            source={{ uri: o.observationPhotos[0]?.photo.url }}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{ width: 50, height: 50 }}
          />
          <Text>{o.uuid}</Text>
        </Pressable>
      ) ) }
    </ViewWithFooter>
  );
};

export default Observations;
