import { useQueries, useQueryClient } from "@tanstack/react-query";
import { searchObservations } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import type { IconicTaxaSectionState } from "components/MyObservations/helpers/iconicTaxaSections";
import { selectCategoryToDeepen } from "components/MyObservations/helpers/iconicTaxaSections";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect, useMemo, useState,
} from "react";
import Observation from "realmModels/Observation";
import type { ICONIC_TAXA_GROUP, IconicTaxaGroupCount } from "sharedHelpers/iconicTaxaGroupOrder";
import { log } from "sharedHelpers/logger";
import { handleRetryDelay, reactQueryRetry } from "sharedHelpers/logging";
import type { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { observationSortToApiParams } from "sharedHelpers/observationsSort";
import { useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

const logger = log.extend( "useIconicTaxaSectionObservations" );

export const QUERY_KEY = "useIconicTaxaSectionObservations";

export const PER_PAGE = 20;

// Pages stay cached long enough to survive leaving and coming back to the tab. Without this,
// React Query's default of 0 would refetch every page a heavy user has loaded on every remount.
const STALE_TIME = 1000 * 60 * 5;

interface IconicTaxonPage {
  totalResults: number;
  uuids: string[];
}

// Highest page number requested per category. A category with no entry has never been fetched,
// so this doubles as the activation frontier.
type PagesByCategory = Partial<Record<ICONIC_TAXA_GROUP, number>>;

// Pages are tracked alongside the sort they were fetched under, so changing sort discards them
// on the next render
interface PageState {
  sortKey: string;
  pages: PagesByCategory;
}

interface Params {
  collapsedCategories: Set<ICONIC_TAXA_GROUP>;
  enabled: boolean;
  orderedCounts: IconicTaxaGroupCount[];
  sortBy: OBSERVATIONS_SORT;
}

interface Result {
  sections: Map<ICONIC_TAXA_GROUP, IconicTaxaSectionState>;
  // start fetching the next category that has anything to fetch
  advanceFrontier: ( ) => void;
  // load the next page of the section the user has scrolled into, or, if that section is
  // finished, start the next category. Safe to call on every onEndReached.
  deepenOrAdvance: ( ) => void;
  // same, for a specific section. Sections aren't necessarily loaded in list order, so the one
  // the user is reading isn't always the deepest one deepenOrAdvance would pick.
  deepenCategory: ( category: ICONIC_TAXA_GROUP ) => void;
  retryCategory: ( category: ICONIC_TAXA_GROUP ) => void;
  refreshSections: ( ) => void;
  resetPagination: ( ) => void;
}

// Paginates each iconic taxa section independently.
//
// useInfiniteQuery can't be called once per category, so this
// models pagination as one useQueries over a flat list of (category, page) descriptors built
// from state. Requesting a page means bumping a number; React Query does the rest, and pages a
// user has already scrolled past stay cached when they scroll back up.
//
// Only one request is ever in flight: activation walks down the categories one at a time
const useIconicTaxaSectionObservations = ( {
  collapsedCategories,
  enabled,
  orderedCounts,
  sortBy,
}: Params ): Result => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );
  const queryClient = useQueryClient( );

  const sortParams = useMemo( ( ) => observationSortToApiParams( sortBy ), [sortBy] );
  const sortKey = `${sortParams.order_by}-${sortParams.order}`;

  const [pageState, setPageState] = useState<PageState>( { sortKey, pages: {} } );

  const pagesByCategory = useMemo( ( ) => {
    const pages = pageState.sortKey === sortKey
      ? pageState.pages
      : {};
    if ( Object.keys( pages ).length > 0 ) return pages;
    // Nothing requested yet, either because the view just opened or because the sort changed.
    // Seed the most-observed category so it starts loading on this render; everything below it
    // waits for the user to scroll or collapse their way down. Categories the server has
    // nothing for are skipped: their header still renders and will show any locally-saved
    // observations, but there's nothing to request.
    const first = orderedCounts.find( ( { count } ) => count > 0 );
    return first
      ? { [first.category]: 1 }
      : pages;
  }, [orderedCounts, pageState, sortKey] );

  const setPages = useCallback( ( pages: PagesByCategory ) => {
    setPageState( { sortKey, pages } );
  }, [sortKey] );

  const descriptors = useMemo( ( ) => orderedCounts.flatMap( ( { category } ) => {
    const highestPage = pagesByCategory[category] ?? 0;
    return Array.from( { length: highestPage }, ( _, index ) => ( {
      category,
      page: index + 1,
    } ) );
  } ), [orderedCounts, pagesByCategory] );

  // Which descriptor indexes belong to each category, so combine can gather a category's pages
  // without rescanning the whole descriptor list per category
  const pageIndexesByCategory = useMemo( ( ) => {
    const indexes = new Map<ICONIC_TAXA_GROUP, number[]>( );
    descriptors.forEach( ( { category }, index ) => {
      const existing = indexes.get( category );
      if ( existing ) {
        existing.push( index );
      } else {
        indexes.set( category, [index] );
      }
    } );
    return indexes;
  }, [descriptors] );

  // Returns a plain array so React Query's replaceEqualDeep can hand back the previous
  // reference when nothing changed, which keeps the row list from rebuilding on every render
  const combine = useCallback( ( queryResults: {
    data?: IconicTaxonPage;
    isPending: boolean;
    isError: boolean;
  }[] ) => orderedCounts.map( ( { category, count } ) => {
    const pages = ( pageIndexesByCategory.get( category ) ?? [] )
      .map( index => queryResults[index] )
      .filter( Boolean );
    const highestPage = pagesByCategory[category] ?? 0;

    // Offset pagination can repeat an observation across pages if the underlying set shifts
    // between requests, and a repeated uuid would be a duplicate key in the list
    const uuids = [...new Set( pages.flatMap( page => page.data?.uuids ?? [] ) )];
    // Until the first page lands we only know the count, which is close enough to decide
    // whether there's more to ask for
    const totalResults = pages[0]?.data?.totalResults ?? count;

    return {
      category,
      uuids,
      isActivated: highestPage > 0,
      isFetching: pages.some( page => page.isPending ),
      isError: pages.some( page => page.isError ),
      hasMore: highestPage * PER_PAGE < totalResults,
    };
  } ), [orderedCounts, pageIndexesByCategory, pagesByCategory] );

  const results = useQueries( {
    queries: descriptors.map( ( { category, page } ) => ( {
      queryKey: [
        QUERY_KEY,
        currentUser?.id,
        sortParams,
        category,
        page,
      ],
      queryFn: async ( ): Promise<IconicTaxonPage> => {
        const apiToken = await getJWT( );
        const response = await searchObservations( {
          user_id: currentUser?.id,
          iconic_taxa: [category],
          ...sortParams,
          page,
          per_page: PER_PAGE,
          fields: Observation.ADVANCED_MODE_LIST_FIELDS,
          ttl: -1,
        }, { api_token: apiToken } );
        const observations = response?.results || [];
        try {
          Observation.upsertRemoteObservations( observations, realm );
        } catch ( upsertError ) {
          logger.error( "Failed to upsert iconic taxa section observations", upsertError );
        }
        return {
          totalResults: response?.total_results ?? 0,
          uuids: observations.map( ( { uuid }: { uuid: string } ) => uuid ),
        };
      },
      enabled: enabled && !!currentUser,
      staleTime: STALE_TIME,
      // Every page a user has scrolled through stays mounted, so a single global event would
      // fan out into one request per loaded page, all at once — 50 parallel observation
      // searches for someone deep in a large category who backgrounds the app or walks through
      // a tunnel. staleTime only narrows the window that can happen in; these close it. This
      // view refreshes on pull-to-refresh and after an upload instead.
      // Turning off reconnect also means a section that failed while offline won't quietly
      // recover, which is why the error row it renders has to offer a retry.
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: ( failureCount: number, error: unknown ) => reactQueryRetry(
        failureCount,
        error,
        { queryKey: ["useIconicTaxaSectionObservations", category] },
      ),
      retryDelay: ( failureCount: number, error: unknown ) => handleRetryDelay(
        failureCount,
        error,
      ),
    } ) ),
    combine,
  } );

  const sections = useMemo(
    ( ) => new Map(
      results.map( ( { category, ...section } ) => [category, section as IconicTaxaSectionState] ),
    ),
    [results],
  );

  const anyFetching = useMemo(
    ( ) => [...sections.values( )].some( section => section.isFetching ),
    [sections],
  );

  const advanceFrontier = useCallback( ( ) => {
    const next = orderedCounts.find(
      ( { category, count } ) => count > 0 && !pagesByCategory[category],
    );
    if ( !next ) return;
    setPages( { ...pagesByCategory, [next.category]: 1 } );
  }, [orderedCounts, pagesByCategory, setPages] );

  const deepenOrAdvance = useCallback( ( ) => {
    if ( anyFetching ) return;
    const category = selectCategoryToDeepen(
      orderedCounts.map( count => count.category ),
      sections,
      collapsedCategories,
    );
    if ( !category ) {
      advanceFrontier( );
      return;
    }
    setPages( {
      ...pagesByCategory,
      [category]: ( pagesByCategory[category] ?? 0 ) + 1,
    } );
  }, [
    advanceFrontier,
    anyFetching,
    collapsedCategories,
    orderedCounts,
    pagesByCategory,
    sections,
    setPages,
  ] );

  const deepenCategory = useCallback( ( category: ICONIC_TAXA_GROUP ) => {
    if ( anyFetching ) return;
    const section = sections.get( category );
    if ( !section?.isActivated || section.isError ) return;
    if ( collapsedCategories.has( category ) ) return;
    if ( !section.hasMore ) {
      // Nothing left in this one, so get a head start on a category that hasn't loaded yet
      advanceFrontier( );
      return;
    }
    setPages( {
      ...pagesByCategory,
      [category]: ( pagesByCategory[category] ?? 0 ) + 1,
    } );
  }, [
    advanceFrontier,
    anyFetching,
    collapsedCategories,
    pagesByCategory,
    sections,
    setPages,
  ] );

  const retryCategory = useCallback( ( category: ICONIC_TAXA_GROUP ) => {
    queryClient.refetchQueries( {
      queryKey: [QUERY_KEY, currentUser?.id, sortParams, category],
    } );
  }, [currentUser?.id, queryClient, sortParams] );

  // Back to the top, as if the view had just opened
  const resetPagination = useCallback( ( ) => setPages( {} ), [setPages] );

  const [refreshCount, setRefreshCount] = useState( 0 );

  const refreshSections = useCallback( ( ) => {
    resetPagination( );
    setRefreshCount( count => count + 1 );
  }, [resetPagination] );

  useEffect( ( ) => {
    if ( refreshCount === 0 ) return;
    queryClient.refetchQueries( { queryKey: [QUERY_KEY] } );
  }, [queryClient, refreshCount] );

  return {
    sections,
    advanceFrontier,
    deepenOrAdvance,
    deepenCategory,
    retryCategory,
    refreshSections,
    resetPagination,
  };
};

export default useIconicTaxaSectionObservations;
