// @flow

import React, { useState } from "react";
import { FlatList, ActivityIndicator } from "react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
import type { Node } from "react";

import GridItem from "./GridItem";

type Props = {
  loading: boolean,
  observationList: Array<Object>,
  testID: string,
  taxonId?: number
}

const GridView = ( {
  loading,
  observationList,
  testID,
  taxonId
}: Props ): Node => {
  const [reviewedIds, setReviewedIds] = useState( [] );
  // const navigation = useNavigation( );
  // const { name } = useRoute( );

  // const navToObsDetails = observation => navigation.navigate( "ObsDetails", { uuid: observation.uuid } );

  const renderGridItem = ( { item } ) => (
    <GridItem
      item={item}
      handlePress={( ) => console.log( "press in identify" )}
      reviewedIds={reviewedIds}
      setReviewedIds={setReviewedIds}
    />
  );

  const renderView = ( ) => (
    <FlatList
      data={observationList}
      key={1}
      renderItem={renderGridItem}
      numColumns={3}
      testID={testID}
    />
  );

  return loading
    ? <ActivityIndicator />
    : renderView( );
};

export default GridView;
