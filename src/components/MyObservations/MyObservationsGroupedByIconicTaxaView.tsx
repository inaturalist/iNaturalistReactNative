import type { FlashListRef } from "@shopify/flash-list";
import {
  ActivityIndicator,
  Body3,
  CollapsibleSectionHeader,
  CustomRefreshControl,
  SmallGrid,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { TFunction } from "i18next";
import { useMyObservations } from "providers/MyObservationsContext";
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { ICONIC_TAXA_GROUP, iconicTaxaGroupIcon } from "sharedHelpers/iconicTaxaGroupOrder";
import { useCurrentUser, useStateResetOn, useTranslation } from "sharedHooks";

import type {
  IconicTaxaHeader,
  IconicTaxaRow,
  IconicTaxaSpan,
} from "./helpers/iconicTaxaSections";
import {
  buildIconicTaxaRows,
  sectionRangeAtRow,
  sectionRowRanges,
} from "./helpers/iconicTaxaSections";
import useIconicTaxaObservationCounts from "./hooks/useIconicTaxaObservationCounts";
import useIconicTaxaSectionObservations from "./hooks/useIconicTaxaSectionObservations";
import useUnsyncedObservationIdsByIconicTaxon
  from "./hooks/useUnsyncedObservationIdsByIconicTaxon";
import SmallGridObsItemContainer from "./SmallGridObsItemContainer";

function iconicTaxaGroupTitles( t: TFunction ): Record<ICONIC_TAXA_GROUP, string> {
  return {
    [ICONIC_TAXA_GROUP.ACTINOPTERYGII]: t( "Fish" ),
    [ICONIC_TAXA_GROUP.AMPHIBIA]: t( "Amphibians" ),
    [ICONIC_TAXA_GROUP.ANIMALIA]: t( "Other-Animals" ),
    [ICONIC_TAXA_GROUP.ARACHNIDA]: t( "Arachnids" ),
    [ICONIC_TAXA_GROUP.AVES]: t( "Birds" ),
    [ICONIC_TAXA_GROUP.CHROMISTA]: t( "Kelp-and-Diatoms" ),
    [ICONIC_TAXA_GROUP.FUNGI]: t( "Fungi" ),
    [ICONIC_TAXA_GROUP.INSECTA]: t( "Insects" ),
    [ICONIC_TAXA_GROUP.MAMMALIA]: t( "Mammals" ),
    [ICONIC_TAXA_GROUP.MOLLUSCA]: t( "Mollusks" ),
    [ICONIC_TAXA_GROUP.PLANTAE]: t( "Plants" ),
    [ICONIC_TAXA_GROUP.PROTOZOA]: t( "Protozoans" ),
    [ICONIC_TAXA_GROUP.REPTILIA]: t( "Reptiles" ),
    [ICONIC_TAXA_GROUP.OTHER]: t( "Other" ),
  };
}

interface Props {
  handlePullToRefresh: ( ) => Promise<void>;
  listHeaderContent?: React.ReactElement | null;
}

const NONE_COLLAPSED: Set<ICONIC_TAXA_GROUP> = new Set( );

// How many tiles ahead of the last loaded one to start fetching.
const PREFETCH_TILES = 15;

const MyObservationsGroupedByIconicTaxaView = ( {
  handlePullToRefresh,
  listHeaderContent,
}: Props ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const { state } = useMyObservations( );
  const { observationsSort } = state;
  const listRef = useRef<FlashListRef<IconicTaxaRow>>( null );

  const titlesByCategory = useMemo( ( ) => iconicTaxaGroupTitles( t ), [t] );

  const {
    counts,
    isLoading: isLoadingCounts,
    refetch: refetchCounts,
  } = useIconicTaxaObservationCounts( );
  const unsyncedByCategory = useUnsyncedObservationIdsByIconicTaxon( );

  // Changing sort reopens every section, since the list they were collapsed against is gone
  const [collapsedCategories, setCollapsedCategories] = useStateResetOn(
    observationsSort,
    NONE_COLLAPSED,
  );

  const {
    sections,
    advanceFrontier,
    refreshSections,
    nearingEndOfSection,
    retryCategory,
  } = useIconicTaxaSectionObservations( {
    collapsedCategories,
    enabled: !!currentUser,
    orderedCounts: counts,
    sortBy: observationsSort,
  } );

  // Changing sort re-sorts every section's contents, so the list the user was reading is gone.
  // Put them back at the top.
  useEffect( ( ) => {
    listRef.current?.scrollToOffset( { animated: false, offset: 0 } );
  }, [observationsSort] );

  // Until the counts land every category reads as zero, so they'd render in the tie-break order
  // and then visibly reshuffle into count order a moment later. Show nothing but the spinner
  // until we know the real order.
  const rows = useMemo( ( ) => ( isLoadingCounts
    ? []
    : buildIconicTaxaRows( {
      collapsedCategories,
      orderedCounts: counts,
      sections,
      unsyncedByCategory,
    } ) ), [collapsedCategories, counts, isLoadingCounts, sections, unsyncedByCategory] );

  const sectionRanges = useMemo( ( ) => sectionRowRanges( rows ), [rows] );

  // Read through a ref so the handler identity stays stable. FlashList subscribes to it, and
  // swapping it on every render churns that subscription.
  const prefetchRef = useRef( { nearingEndOfSection, sectionRanges } );
  useEffect( ( ) => {
    prefetchRef.current = { nearingEndOfSection, sectionRanges };
  }, [nearingEndOfSection, sectionRanges] );

  // Tells us which row is at the top of the screen, so collapsing can tell whether the user is
  // inside the section they just closed or looking at its header from outside
  const firstVisibleIndexRef = useRef( 0 );

  const onViewableItemsChanged = useCallback( ( { viewableItems }: {
    viewableItems: { index: number | null }[];
  } ) => {
    firstVisibleIndexRef.current = viewableItems[0]?.index ?? 0;
    const { nearingEndOfSection, sectionRanges: ranges } = prefetchRef.current;
    const lastVisibleIndex = viewableItems[viewableItems.length - 1]?.index;
    if ( lastVisibleIndex == null ) return;
    const range = sectionRangeAtRow( ranges, lastVisibleIndex );
    if ( !range ) return;
    const isNearEnd = range.lastTileRow < 0
      || lastVisibleIndex >= range.lastTileRow - PREFETCH_TILES;
    if ( isNearEnd ) nearingEndOfSection( range.category );
  }, [] );

  // #region managing sticky header toggling and scroll position

  // Row index to put back at the top of the screen once a collapse has re-rendered
  const pinHeaderRowRef = useRef<number | null>( null );

  const toggleCategory = useCallback( ( category: ICONIC_TAXA_GROUP ) => {
    const isCollapsing = !collapsedCategories.has( category );
    const categories = new Set( collapsedCategories );
    if ( isCollapsing ) {
      categories.add( category );
    } else {
      categories.delete( category );
    }
    setCollapsedCategories( categories );
    if ( !isCollapsing ) return;

    const headerRow = rows.findIndex(
      row => row.type === "header" && row.header.category === category,
    );
    if ( headerRow >= 0 && headerRow < firstVisibleIndexRef.current ) {
      pinHeaderRowRef.current = headerRow;
    }

    advanceFrontier( );
  }, [advanceFrontier, collapsedCategories, rows, setCollapsedCategories] );

  useEffect( ( ) => {
    const index = pinHeaderRowRef.current;
    if ( index === null ) return;
    pinHeaderRowRef.current = null;
    listRef.current?.scrollToIndex( { animated: false, index, viewPosition: 0 } );
  }, [rows] );
  // #endregion

  const [refreshing, setRefreshing] = useState( false );

  // Taxa counts determine section order and the section queries drive their contents, so a refresh
  // has to cover both
  const onRefresh = useCallback( async ( ) => {
    setRefreshing( true );
    await handlePullToRefresh( );
    refetchCounts( );
    refreshSections( );
    setRefreshing( false );
  }, [handlePullToRefresh, refetchCounts, refreshSections] );

  const refreshControl = useMemo( ( ) => (
    <CustomRefreshControl
      accessibilityLabel={t( "Pull-to-refresh-and-sync-observations" )}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  ), [onRefresh, refreshing, t] );

  const renderHeader = useCallback( ( header: IconicTaxaHeader ) => (
    <CollapsibleSectionHeader
      count={header.count}
      icon={iconicTaxaGroupIcon( header.category )}
      isOpen={header.isOpen}
      onToggle={( ) => toggleCategory( header.category )}
      testID={`MyObservationsGroupedByIconicTaxaView.Header.${header.category}`}
      title={titlesByCategory[header.category]}
    />
  ), [titlesByCategory, toggleCategory] );

  const renderSpan = useCallback( ( span: IconicTaxaSpan ) => {
    if ( span.kind === "error" ) {
      return (
        <Pressable
          accessibilityRole="button"
          className="py-4 items-center"
          onPress={( ) => retryCategory( span.category )}
          testID={`MyObservationsGroupedByIconicTaxaView.SectionError.${span.category}`}
        >
          <Body3>{t( "Tap-to-try-loading-again" )}</Body3>
        </Pressable>
      );
    }
    return (
      <View
        className="py-4"
        testID={`MyObservationsGroupedByIconicTaxaView.SectionLoading.${span.category}`}
      >
        <ActivityIndicator />
      </View>
    );
  }, [retryCategory, t] );

  const renderTile = useCallback( ( uuid: string, width: number, height: number ) => (
    <SmallGridObsItemContainer
      currentUser={currentUser}
      height={height}
      uuid={uuid}
      width={width}
    />
  ), [currentUser] );

  const listFooterContent = useMemo( ( ) => ( isLoadingCounts
    ? (
      <View className="py-8">
        <ActivityIndicator />
      </View>
    )
    : null ), [isLoadingCounts] );

  if ( !currentUser ) return null;

  return (
    <SmallGrid
      data={rows}
      listFooterContent={listFooterContent}
      listHeaderContent={listHeaderContent}
      onViewableItemsChanged={onViewableItemsChanged}
      ref={listRef}
      refreshControl={refreshControl}
      renderHeader={renderHeader}
      renderSpan={renderSpan}
      renderTile={renderTile}
      stickyHeaders
      testID="MyObservationsGroupedByIconicTaxaView"
    />
  );
};

export default MyObservationsGroupedByIconicTaxaView;
