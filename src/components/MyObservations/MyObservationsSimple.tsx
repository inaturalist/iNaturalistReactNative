import { FlashList } from "@shopify/flash-list";
import ObservationsViewBar from "components/Explore/ObservationsViewBar";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import {
  Body1,
  Body3,
  Heading3,
  Heading5,
  RotatingINatIconButton,
  Tabs,
  UserIcon,
  ViewWrapper
} from "components/SharedComponents";
import CustomFlashList from "components/SharedComponents/FlashList/CustomFlashList.tsx";
import TaxonGridItem from "components/SharedComponents/TaxonGridItem.tsx";
import { Pressable, View } from "components/styledComponents";
import React, { useCallback, useMemo } from "react";
import Realm from "realm";
import type {
  RealmObservation,
  RealmTaxon,
  RealmUser
} from "realmModels/types";
import User from "realmModels/User.ts";
import { useGridLayout, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import Announcements from "./Announcements";
import LoginSheet from "./LoginSheet";

export interface Props {
  activeTab: string;
  currentUser?: RealmUser;
  handleIndividualUploadPress: ( uuid: string ) => void;
  handlePullToRefresh: ( ) => void;
  handleSyncButtonPress: ( ) => void;
  isConnected: boolean;
  isFetchingNextPage: boolean;
  layout: "list" | "grid";
  listRef?: React.RefObject<FlashList<RealmObservation>>;
  numTotalObservations?: number;
  numTotalTaxa?: number;
  numUnuploadedObservations: number;
  observations: RealmObservation[];
  onEndReached: ( ) => void;
  onListLayout?: ( ) => void;
  onScroll?: ( ) => void;
  setActiveTab: ( newTab: string ) => void;
  setShowLoginSheet: ( newValue: boolean ) => void;
  showLoginSheet: boolean;
  showNoResults: boolean;
  taxa?: RealmTaxon[] | Realm.Results;
  toggleLayout: ( ) => void;
}

interface TaxaFlashListRenderItemProps {
  // I'm pretty sure this is some kind of bug ~~~~kueda 20250108
  // eslint-disable-next-line react/no-unused-prop-types
  item: RealmTaxon;
}

export const OBSERVATIONS_TAB = "observations";
export const TAXA_TAB = "taxa";

const MyObservationsSimple = ( {
  activeTab,
  currentUser,
  handleIndividualUploadPress,
  handlePullToRefresh,
  handleSyncButtonPress,
  isConnected,
  isFetchingNextPage,
  layout,
  listRef,
  numTotalObservations,
  numTotalTaxa,
  numUnuploadedObservations,
  observations,
  onEndReached,
  onListLayout,
  onScroll,
  setActiveTab,
  setShowLoginSheet,
  showLoginSheet,
  showNoResults,
  taxa,
  toggleLayout
}: Props ) => {
  const { t } = useTranslation( );
  const {
    estimatedGridItemSize,
    flashListStyle,
    gridItemStyle,
    numColumns
  } = useGridLayout( );
  const taxaFlashListStyle = useMemo( ( ) => ( {
    ...flashListStyle,
    paddingTop: 10
  } ), [flashListStyle] );

  // If I define this interface outside of the component like a sane person
  // eslint has a mysterious fit. ~~~~kueda 20250108
  interface StatTabProps {
    id: string;
    text: string;
  }
  const StatTab = useCallback( ( { id, text: _text }: StatTabProps ) => {
    let stat: number | undefined;
    let label: string;
    if ( id === OBSERVATIONS_TAB ) {
      stat = numTotalObservations;
      label = t( "X-OBSERVATIONS--below-number", { count: numTotalObservations || 0 } );
    } else {
      stat = numTotalTaxa;
      label = t( "X-SPECIES--below-number", { count: numTotalTaxa || 0 } );
    }
    return (
      <View className="items-center p-3">
        <Body1 className="mb-[4px]">
          {
            typeof ( stat ) === "number"
              ? t( "Intl-number", { val: stat } )
              : "--"
          }
        </Body1>
        <Heading5>{ label }</Heading5>
      </View>
    );
  }, [t, numTotalObservations, numTotalTaxa] );

  return (
    <>
      <ViewWrapper isDebug>
        { numUnuploadedObservations >= 10 && (
          <Pressable
            accessibilityRole="button"
            className="bg-inatGreen p-2 items-center"
            onPress={handleSyncButtonPress}
          >
            <Body3 className="text-white">
              { t( "Upload-x-observations", { count: numUnuploadedObservations } ) }
            </Body3>
          </Pressable>
        ) }
        <View className="flex-row justify-between items-center px-5 py-1">
          <View className="flex-row items-center">
            {currentUser && (
              <View className="mr-2">
                <UserIcon size={32} uri={User.uri( currentUser )} />
              </View>
            )}
            <Heading3>
              {
                currentUser
                  ? currentUser.login
                  : t( "My-Observations" )
              }
            </Heading3>
          </View>
          <RotatingINatIconButton
            icon={
              numUnuploadedObservations > 0
                ? "sync-unsynced"
                : "sync"
            }
            onPress={handleSyncButtonPress}
            color={String(
              numUnuploadedObservations > 0
                ? colors?.inatGreen
                : colors?.darkGray
            )}
            accessibilityLabel={t( "Sync-observations" )}
            size={26}
            testID="SyncButton"
          />
        </View>
        <Tabs
          activeColor={String( colors?.inatGreen )}
          activeId={activeTab}
          tabs={[
            {
              id: OBSERVATIONS_TAB,
              text: t( "Observations" ),
              onPress: () => setActiveTab( OBSERVATIONS_TAB )
            },
            {
              id: TAXA_TAB,
              text: t( "Species" ),
              onPress: () => setActiveTab( TAXA_TAB )
            }
          ]}
          TabComponent={StatTab}
        />
        { activeTab === OBSERVATIONS_TAB && (
          <>
            <ObservationsFlashList
              data={observations.filter( o => o.isValid() )}
              handlePullToRefresh={handlePullToRefresh}
              handleIndividualUploadPress={handleIndividualUploadPress}
              hideLoadingWheel
              hideMetadata
              isFetchingNextPage={isFetchingNextPage}
              isConnected={isConnected}
              obsListKey="MyObservations"
              layout={layout}
              onEndReached={onEndReached}
              onLayout={onListLayout}
              onScroll={onScroll}
              ref={listRef}
              showObservationsEmptyScreen
              showNoResults={showNoResults}
              testID="MyObservationsAnimatedList"
              renderHeader={(
                <Announcements isConnected={isConnected} />
              )}
            />
            <ObservationsViewBar
              hideMap
              layout={layout}
              updateObservationsView={toggleLayout}
            />
          </>
        ) }
        { activeTab === TAXA_TAB && (
          <CustomFlashList
            canFetch={false}
            contentContainerStyle={taxaFlashListStyle}
            data={taxa}
            estimatedItemSize={estimatedGridItemSize}
            hideLoadingWheel
            isConnected={false}
            keyExtractor={( item: RealmTaxon ) => item.id}
            layout="grid"
            numColumns={numColumns}
            renderItem={( { item }: TaxaFlashListRenderItemProps ) => item && (
              <TaxonGridItem
                style={gridItemStyle}
                taxon={item}
              />
            )}
            totalResults={numTotalTaxa}
            testID="ExploreSpeciesAnimatedList"
          />
        ) }
      </ViewWrapper>
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
    </>
  );
};

export default MyObservationsSimple;
