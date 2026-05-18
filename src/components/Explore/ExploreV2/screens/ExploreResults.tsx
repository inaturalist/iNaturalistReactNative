import { useNetInfo } from "@react-native-community/netinfo";
import buildExploreV2QueryParams
  from "components/Explore/ExploreV2/buildQueryParams";
import ExploreV2DebugSheet
  from "components/Explore/ExploreV2/ExploreV2DebugSheet";
import useInfiniteExploreScroll
  from "components/Explore/hooks/useInfiniteExploreScroll";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import {
  Body2,
  Button,
  ViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { EXPLORE_V2_PLACE_MODE, useExploreV2 } from "providers/ExploreV2Context";
import React from "react";
import { useTranslation } from "sharedHooks";

const ExploreResults = ( ) => {
  const { state, requestLocationPermissions } = useExploreV2( );
  const { isConnected } = useNetInfo( );
  const { t } = useTranslation( );

  const queryParams = buildExploreV2QueryParams( state );

  const canFetch = state.location.placeMode !== EXPLORE_V2_PLACE_MODE.UNINITIALIZED
    && state.location.placeMode !== EXPLORE_V2_PLACE_MODE.NEEDS_PERMISSION;

  const {
    fetchNextPage,
    isFetchingNextPage,
    handlePullToRefresh,
    observations,
    totalResults,
  } = useInfiniteExploreScroll( { params: queryParams, enabled: canFetch } );

  const renderPermissionPrompt = ( ) => (
    <View className="flex-1 justify-center p-4">
      <View className="items-center">
        <Body2>{t( "To-view-nearby-organisms-please-enable-location" )}</Body2>
      </View>
      <Button
        className="mt-5"
        text={t( "ALLOW-LOCATION-ACCESS" )}
        accessibilityHint={t( "Opens-location-permission-prompt" )}
        level="focus"
        onPress={requestLocationPermissions}
      />
    </View>
  );

  return (
    <ViewWrapper testID="ExploreResults" wrapperClassName="overflow-hidden">
      <View className="flex-1 overflow-hidden">
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <Body2>TODO: Header — MOB-1327</Body2>
        {state.location.placeMode === EXPLORE_V2_PLACE_MODE.NEEDS_PERMISSION
          ? renderPermissionPrompt( )
          : (
            <>
              <ObservationsFlashList
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
              <ExploreV2DebugSheet />
            </>
          )}
      </View>
    </ViewWrapper>
  );
};

export default ExploreResults;
