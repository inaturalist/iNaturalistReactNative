import { useRoute } from "@react-navigation/native";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";

import useRepository from "./useRepository";

const Detail = ( ) => {
  const [observation, setObservation] = useState( null );
  const repo = useRepository( "Observation" );
  const { params } = useRoute( );
  const { uuid } = params;

  useEffect( ( ) => {
    async function getObservation( ) {
      if ( uuid ) {
        setObservation( await repo?.get( uuid ) );
      } else {
        setObservation( null );
      }
    }
    getObservation( );
  }, [uuid, repo] );

  return (
    <ViewWithFooter>
      <Text>{ observation?.uuid }</Text>
      <Text>{ observation?.species_guess }</Text>
      <Text>{ observation?.taxon?.name }</Text>
    </ViewWithFooter>
  );
};

export default Detail;
