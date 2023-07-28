// @flow

import type { Node } from "react";
import React from "react";
import { useInfiniteScroll } from "sharedHooks";

import Explore from "./Explore";

const ExploreContainer = ( ): Node => {
  // const { t } = useTranslation( );
  // const [view, setView] = useState( "list" );
  const {
    observations, isFetchingNextPage, fetchNextPage
  } = useInfiniteScroll( { upsert: false } );

  return (
    <Explore
      observations={observations}
      isFetchingNextPage={isFetchingNextPage}
      onEndReached={fetchNextPage}
    />
  );
};

export default ExploreContainer;
