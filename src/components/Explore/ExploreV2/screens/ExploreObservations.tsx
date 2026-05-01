import { useNetInfo } from "@react-native-community/netinfo";
import classnames from "classnames";
import buildExploreV2QueryParams
  from "components/Explore/ExploreV2/buildQueryParams";
import ExploreV2DebugSheet
  from "components/Explore/ExploreV2/ExploreV2DebugSheet";
import useInfiniteExploreScroll
  from "components/Explore/hooks/useInfiniteExploreScroll";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import {
  Body2,
  INatIconButton,
  ViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { EXPLORE_V2_PLACE_MODE, useExploreV2 } from "providers/ExploreV2Context";
import React, { useMemo, useState } from "react";
import { Text } from "react-native";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6,
} );

const OBS_LIST_CONTAINER_STYLE = { paddingTop: 50 };

const ExploreObservations = ( ) => {
  const { state } = useExploreV2( );
  const { isConnected } = useNetInfo( );
  const [debugVisible, setDebugVisible] = useState( false );

  const queryParams = useMemo( () => buildExploreV2QueryParams( state ), [state] );

  const canFetch = state.location.placeMode !== EXPLORE_V2_PLACE_MODE.UNINITIALIZED;

  const {
    fetchNextPage,
    isFetchingNextPage,
    handlePullToRefresh,
    observations,
    totalResults,
  } = useInfiniteExploreScroll( { params: queryParams, enabled: canFetch } );

  return (
    <ViewWrapper testID="ExploreObservations" wrapperClassName="overflow-hidden">
      <View className="flex-1 overflow-hidden">
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <Body2>TODO: Header — MOB-1327 (tap to open Universal Search)</Body2>
        {canFetch
          ? (
            <ObservationsFlashList
              contentContainerStyle={OBS_LIST_CONTAINER_STYLE}
              data={observations}
              dataCanBeFetched={canFetch}
              explore
              handlePullToRefresh={handlePullToRefresh}
              hideLoadingWheel={!isFetchingNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isConnected={isConnected}
              layout="list"
              obsListKey="ExploreV2Observations"
              onEndReached={fetchNextPage}
              showNoResults={!canFetch || totalResults === 0}
              testID="ExploreV2ObservationsList"
            />
          )
          /* eslint-disable-next-line i18next/no-literal-string */
          : <Text> Explore state uninitialized </Text>}
        <INatIconButton
          icon="triangle-exclamation"
          className={classnames(
            "absolute",
            "bg-white",
            "bottom-[100px]",
            "h-[55px]",
            "right-5",
            "rounded-full",
            "w-[55px]",
            "z-10",
          )}
          color="white"
          size={27}
          style={[
            DROP_SHADOW,
            // eslint-disable-next-line react-native/no-inline-styles
            { backgroundColor: "deeppink" },
          ]}
          accessibilityLabel="Diagnostics"
          onPress={() => setDebugVisible( true )}
        />

        <ExploreV2DebugSheet
          visible={debugVisible}
          onClose={() => setDebugVisible( false )}
          state={state}
          queryParams={queryParams}
        />
      </View>
    </ViewWrapper>
  );
};

export default ExploreObservations;
