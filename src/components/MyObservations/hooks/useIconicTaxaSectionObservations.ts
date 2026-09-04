import { useQueries, useQueryClient } from "@tanstack/react-query";
import { searchObservations } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import type { IconicTaxaSectionState } from "components/MyObservations/helpers/iconicTaxaSections";
import { RealmContext } from "providers/contexts";
import { useCallback, useMemo } from "react";
import Observation from "realmModels/Observation";
import type { ICONIC_TAXA_GROUP, IconicTaxaGroupCount } from "sharedHelpers/iconicTaxaGroupOrder";
import { handleRetryDelay, reactQueryRetry } from "sharedHelpers/logging";
import type { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { observationSortToApiParams } from "sharedHelpers/observationsSort";
import { useCurrentUser, useStateResetOn } from "sharedHooks";

const { useRealm } = RealmContext;

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

const NOTHING_REQUESTED: PagesByCategory = {};

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
  // The caller knows only that the user is near the end of one category's tiles;
  // so we need to manage the following states:
  //
  //   something already in flight     -> nothing, so scrolling can't stack up requests
  //   errored, or collapsed           -> nothing; a failed section waits for retryCategory
  //   the category has pages left     -> fetch its next page
  //   never fetched, or fully loaded  -> start the next category that has anything to fetch
  nearingEndOfSection: ( category: ICONIC_TAXA_GROUP ) => void;
  retryCategory: ( category: ICONIC_TAXA_GROUP ) => void;
  refreshSections: ( ) => void;
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

  // Changing sort invalidates every page, so this starts over rather than re-requesting them
  // all under the new order
  const [requestedPages, setPages] = useStateResetOn( sortKey, NOTHING_REQUESTED );

  // Before the user has asked for anything, the most-observed category is treated as already
  // requested so it starts loading on this render; everything below it waits for them to
  // scroll or collapse their way down. Seeded rather than written back, so requestedPages
  // stays honest about what the user has actually asked for. Categories the server has nothing
  // for are skipped: their header still renders and will show any locally-saved observations,
  // but there's nothing to request.
  const pagesByCategory = useMemo( ( ) => {
    if ( Object.keys( requestedPages ).length > 0 ) return requestedPages;
    const first = orderedCounts.find( ( { count } ) => count > 0 );
    return first
      ? { [first.category]: 1 }
      : requestedPages;
  }, [orderedCounts, requestedPages] );

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
      // realm is a handle to the one open database rather than something the results vary by,
      // so it doesn't belong in the key
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
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
        // Deliberately not caught: tiles hydrate from Realm by uuid, so a page whose
        // observations didn't make it into Realm can't render. Failing the query puts the
        // section into its error state, with a retry, instead of a run of blank tiles.
        Observation.upsertRemoteObservations( observations, realm );
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
        { queryKey: [QUERY_KEY, category] },
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

  // See the Result type above for the full set of cases this decides between
  const nearingEndOfSection = useCallback( ( category: ICONIC_TAXA_GROUP ) => {
    if ( anyFetching ) return;
    const section = sections.get( category );
    if ( section?.isError || collapsedCategories.has( category ) ) return;
    if ( !section?.isActivated || !section.hasMore ) {
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

  const refreshSections = useCallback( ( ) => {
    // Scoped to the current user and sort selection. Pages cached under another sort, or
    // another user, would otherwise refire the moment they were rendered again.
    queryClient.invalidateQueries( { queryKey: [QUERY_KEY, currentUser?.id, sortParams] } );
  }, [currentUser?.id, queryClient, sortParams] );

  return {
    sections,
    advanceFrontier,
    nearingEndOfSection,
    retryCategory,
    refreshSections,
  };
};

export default useIconicTaxaSectionObservations;
