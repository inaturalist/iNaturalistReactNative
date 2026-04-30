import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import buildExploreV2QueryParams
  from "components/Explore/ExploreV2/buildQueryParams";
import useInfiniteExploreScroll
  from "components/Explore/hooks/useInfiniteExploreScroll";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import {
  Body2,
  INatIconButton,
  ViewWrapper,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { EXPLORE_V2_PLACE_MODE, useExploreV2 } from "providers/ExploreV2Context";
import React, { useMemo } from "react";
import { Alert } from "react-native";
import useDebugMode from "sharedHooks/useDebugMode";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6,
} );

const OBS_LIST_CONTAINER_STYLE = { paddingTop: 50 };

const ExploreObservations = ( ) => {
  const navigation = useNavigation( );
  const { state } = useExploreV2( );
  const { isConnected } = useNetInfo( );
  const { isDebug } = useDebugMode( );

  const queryParams = useMemo( () => buildExploreV2QueryParams( state ), [state] );

  // Don't fetch until placeMode has resolved to something usable: worldwide
  // (no coords needed), nearby with coords, or a specific place.
  const canFetch = state.placeMode === EXPLORE_V2_PLACE_MODE.WORLDWIDE
    || (
      state.placeMode === EXPLORE_V2_PLACE_MODE.NEARBY
      && queryParams.lat !== undefined
    )
    || (
      state.placeMode === EXPLORE_V2_PLACE_MODE.PLACE
      && queryParams.place_id !== undefined
    );

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
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate( "UniversalSearch" )}
        >
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <Body2>TODO: Header — MOB-1327 (tap to open Universal Search)</Body2>
        </Pressable>
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
        {isDebug && (
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
            onPress={() => {
              Alert.alert(
                "ExploreV2 Info",
                `state: ${JSON.stringify( state, null, 2 )}\n\nqueryParams: ${
                  JSON.stringify( queryParams, null, 2 )
                }`,
              );
            }}
          />
        )}
      </View>
    </ViewWrapper>
  );
};

export default ExploreObservations;
