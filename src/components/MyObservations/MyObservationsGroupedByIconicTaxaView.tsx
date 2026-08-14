import type { FlashListRef } from "@shopify/flash-list";
import {
  ActivityIndicator,
  Body3,
  CollapsibleSectionHeader,
  SmallGrid,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { TFunction } from "i18next";
import { useMyObservations } from "providers/MyObservationsContext";
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { ICONIC_TAXA_GROUP, iconicTaxaGroupIcon } from "sharedHelpers/iconicTaxaGroupOrder";
import type { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { useCurrentUser, useTranslation } from "sharedHooks";

import type {
  IconicTaxaHeader,
  IconicTaxaRow,
  IconicTaxaSpan,
} from "./helpers/iconicTaxaSections";
import { buildIconicTaxaRows, lastTileRowIndex } from "./helpers/iconicTaxaSections";
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
  listHeaderContent?: React.ReactElement | null;
}

// Which categories the user has collapsed, tracked alongside the sort they were collapsed
// under so changing sort reopens everything without an effect
interface CollapseState {
  sortBy: OBSERVATIONS_SORT;
  categories: Set<ICONIC_TAXA_GROUP>;
}

const NONE_COLLAPSED: Set<ICONIC_TAXA_GROUP> = new Set( );

// How many tiles ahead of the last loaded one to start fetching.
const PREFETCH_TILES = 15;

const MyObservationsGroupedByIconicTaxaView = ( { listHeaderContent }: Props ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const { state } = useMyObservations( );
  const { observationsSort } = state;
  const listRef = useRef<FlashListRef<IconicTaxaRow>>( null );

  const titlesByCategory = useMemo( ( ) => iconicTaxaGroupTitles( t ), [t] );

  const {
    counts,
    isLoading: isLoadingCounts,
  } = useIconicTaxaObservationCounts( );
  const unsyncedByCategory = useUnsyncedObservationIdsByIconicTaxon( );

  const [collapseState, setCollapseState] = useState<CollapseState>( {
    sortBy: observationsSort,
    categories: NONE_COLLAPSED,
  } );
  const collapsedCategories = collapseState.sortBy === observationsSort
    ? collapseState.categories
    : NONE_COLLAPSED;

  const {
    sections,
    advanceFrontier,
    deepenOrAdvance,
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

  const toggleCategory = useCallback( ( category: ICONIC_TAXA_GROUP ) => {
    const isCollapsing = !collapsedCategories.has( category );
    const categories = new Set( collapsedCategories );
    if ( isCollapsing ) {
      categories.add( category );
    } else {
      categories.delete( category );
    }
    setCollapseState( { sortBy: observationsSort, categories } );
    // Collapsing is the user saying they're done with this category, so start loading the next
    // one now rather than making them scroll to trigger it
    if ( isCollapsing ) advanceFrontier( );
  }, [advanceFrontier, collapsedCategories, observationsSort] );

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

  // Read through a ref so the handler identity stays stable. FlashList subscribes to it, and
  // swapping it on every render churns that subscription.
  const lastTileIndex = useMemo( ( ) => lastTileRowIndex( rows ), [rows] );
  const prefetchRef = useRef( { deepenOrAdvance, lastTileIndex } );
  useEffect( ( ) => {
    prefetchRef.current = { deepenOrAdvance, lastTileIndex };
  }, [deepenOrAdvance, lastTileIndex] );

  const onViewableItemsChanged = useCallback( ( { viewableItems }: {
    viewableItems: { index: number | null }[];
  } ) => {
    const { deepenOrAdvance: deepen, lastTileIndex } = prefetchRef.current;
    if ( lastTileIndex < 0 ) return;
    const lastVisibleIndex = viewableItems[viewableItems.length - 1]?.index;
    if ( lastVisibleIndex == null ) return;
    if ( lastVisibleIndex >= lastTileIndex - PREFETCH_TILES ) deepen( );
  }, [] );

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
      onEndReached={deepenOrAdvance}
      onViewableItemsChanged={onViewableItemsChanged}
      ref={listRef}
      renderHeader={renderHeader}
      renderSpan={renderSpan}
      renderTile={renderTile}
      testID="MyObservationsGroupedByIconicTaxaView"
    />
  );
};

export default MyObservationsGroupedByIconicTaxaView;
