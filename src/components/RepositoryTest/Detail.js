import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useRepository from "./useRepository";

const Detail = ( ) => {
  const [observation, setObservation] = useState( null );
  const repo = useRepository( "Observation" );
  const { params } = useRoute( );
  const { uuid } = params;

  useEffect( ( ) => {
    if ( uuid ) {
      setObservation( repo?.get( uuid ) );
    } else {
      setObservation( null );
    }
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
