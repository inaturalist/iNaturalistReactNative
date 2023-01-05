// @flow

// import { useNavigation, useRoute } from "@react-navigation/native";
import type { Node } from "react";
import React, { useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";

import GridItem from "./GridItem";

type Props = {
  loading: boolean,
  observationList: Array<Object>,
  testID: string
}

const GridView = ( {
  loading,
  observationList,
  testID
}: Props ): Node => {
  const [reviewedIds, setReviewedIds] = useState( [] );

  const renderGridItem = ( { item } ) => (
    <GridItem
      item={item}
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
