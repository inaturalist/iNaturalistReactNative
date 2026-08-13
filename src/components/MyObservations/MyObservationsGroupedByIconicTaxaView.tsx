import { CollapsibleSectionHeader, SmallGrid } from "components/SharedComponents";
import type { SmallGridItem } from "components/SharedComponents/SmallGrid";
import type { TFunction } from "i18next";
import React, { useCallback, useMemo, useState } from "react";
import {
  ICONIC_TAXA_GROUP,
  ICONIC_TAXA_GROUP_ORDER,
  iconicTaxaGroupIcon,
} from "sharedHelpers/iconicTaxaGroupOrder";
import { useCurrentUser, useTranslation } from "sharedHooks";
import useLocalObservationIds from "sharedHooks/useLocalObservationIds";

import useIconicTaxaObservationCounts from "./hooks/useIconicTaxaObservationCounts";
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

interface HeaderData {
  category: ICONIC_TAXA_GROUP;
  count: number;
  isOpen: boolean;
}

type GroupedRow = SmallGridItem<string, HeaderData>;

const MyObservationsGroupedByIconicTaxaView = ( { listHeaderContent }: Props ) => {
  const { t } = useTranslation( );
  const localObservationIds = useLocalObservationIds( );
  const currentUser = useCurrentUser( );
  const iconicTaxaCounts = useIconicTaxaObservationCounts( );
  const unsyncedByCategory = useUnsyncedObservationIdsByIconicTaxon( );
  const titlesByCategory = useMemo( ( ) => iconicTaxaGroupTitles( t ), [t] );

  // Unsynced obs are bucketed for real, by their local taxon. The rest are still a temporary.
  // TODO: per-category fetching.
  const observationsByCategory = useMemo( ( ) => {
    const pinnedUuids = new Set(
      [...unsyncedByCategory.values( )].flat( ),
    );
    const buckets = new Map<ICONIC_TAXA_GROUP, string[]>(
      ICONIC_TAXA_GROUP_ORDER.map( category => [
        category,
        [...unsyncedByCategory.get( category ) ?? []],
      ] ),
    );
    localObservationIds
      .filter( ( { uuid } ) => !pinnedUuids.has( uuid ) )
      .forEach( ( { uuid }, index ) => {
        const category = ICONIC_TAXA_GROUP_ORDER[index % ICONIC_TAXA_GROUP_ORDER.length];
        buckets.get( category )?.push( uuid );
      } );
    return buckets;
  }, [localObservationIds, unsyncedByCategory] );

  const [closedCategories, setClosedCategories] = useState<Set<ICONIC_TAXA_GROUP>>(
    ( ) => new Set( ),
  );

  const toggleCategory = useCallback( ( category: ICONIC_TAXA_GROUP ) => {
    setClosedCategories( prev => {
      const next = new Set( prev );
      if ( next.has( category ) ) {
        next.delete( category );
      } else {
        next.add( category );
      }
      return next;
    } );
  }, [] );

  // Sections are ordered most-observed to least-observed, which is the order iconicTaxaCounts
  // comes back in.ICONIC_TAXA_GROUP_ORDER is the tie-break order that hook sorts by.
  const rows = useMemo( ( ) => iconicTaxaCounts.flatMap( ( { category, count } ): GroupedRow[] => {
    const observations = observationsByCategory.get( category ) ?? [];
    if ( observations.length === 0 ) return [];

    const isOpen = !closedCategories.has( category );
    const headerRow: GroupedRow = {
      type: "header",
      key: `header-${category}`,
      header: { category, count, isOpen },
    };
    if ( !isOpen ) return [headerRow];

    const tileRows: GroupedRow[] = observations.map( uuid => ( {
      type: "tile",
      key: uuid,
      tile: uuid,
    } ) );
    return [headerRow, ...tileRows];
  } ), [observationsByCategory, closedCategories, iconicTaxaCounts] );

  const renderHeader = useCallback( ( header: HeaderData ) => (
    <CollapsibleSectionHeader
      count={header.count}
      icon={iconicTaxaGroupIcon( header.category )}
      isOpen={header.isOpen}
      onToggle={( ) => toggleCategory( header.category )}
      testID={`MyObservationsGroupedByIconicTaxaView.Header.${header.category}`}
      title={titlesByCategory[header.category]}
    />
  ), [titlesByCategory, toggleCategory] );

  const renderTile = useCallback( ( uuid: string, width: number, height: number ) => (
    <SmallGridObsItemContainer
      currentUser={currentUser}
      height={height}
      uuid={uuid}
      width={width}
    />
  ), [currentUser] );

  if ( !currentUser ) return null;

  return (
    <SmallGrid
      data={rows}
      listHeaderContent={listHeaderContent}
      renderHeader={renderHeader}
      renderTile={renderTile}
      testID="MyObservationsGroupedByIconicTaxaView"
    />
  );
};

export default MyObservationsGroupedByIconicTaxaView;
