import type { SmallGridItem } from "components/SharedComponents/SmallGrid";
import type { ICONIC_TAXA_GROUP, IconicTaxaGroupCount } from "sharedHelpers/iconicTaxaGroupOrder";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";

// Shared by section pages and counts so they go stale together (hasMore comes from the count).
// Long enough that a remount doesn't refetch every loaded page, or overwrite a count adjusted
// locally with one from a search index that hasn't caught up.
export const ICONIC_TAXA_STALE_TIME = 1000 * 60 * 5;

// This is what one iconic-taxa section knows about its own server results. Owned by
// useIconicTaxaSectionObservations; the functions here only read it.
export interface IconicTaxaSectionState {
  // page-ordered uuids of this category's observations, as far as we've fetched them
  uuids: string[];
  // true if we've requested at least the first page of results
  isActivated: boolean;
  isFetching: boolean;
  isError: boolean;
  // true if there are pages we haven't requested yet
  hasMore: boolean;
}

export interface IconicTaxaHeader {
  category: ICONIC_TAXA_GROUP;
  count: number;
  isOpen: boolean;
}

// Full-width rows at the end of a section
export interface IconicTaxaSpan {
  category: ICONIC_TAXA_GROUP;
  kind: "loading" | "error";
}

export type IconicTaxaRow = SmallGridItem<string, IconicTaxaHeader, IconicTaxaSpan>;

// The fields that decide where an observation falls in the server's order
export interface SortableObservation {
  id?: number | null;
  observed_on?: string | null;
  observed_on_string?: string | null;
  time_observed_at?: string | null;
}

interface SortKey {
  // null sorts last in either direction, as the server does with observations that have no date
  value: number | null;
  id: number;
}

function parsedTime( dateString?: string | null ): number | null {
  if ( !dateString ) return null;
  const time = Date.parse( dateString );
  return Number.isNaN( time )
    ? null
    : time;
}

// The server orders the date-observed sorts by the moment observed, treating an observation
// with only a date as the start of that day, then by id. A new upload has neither
// time_observed_at nor observed_on until its server copy loads, so its local date string, read
// in the device's time zone, stands in until then.
function sortKey( sort: OBSERVATIONS_SORT, observation: SortableObservation | null ): SortKey {
  const id = observation?.id ?? 0;
  if (
    sort === OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST
    || sort === OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST
  ) {
    const observedAt = parsedTime( observation?.time_observed_at )
      ?? parsedTime( observation?.observed_on )
      ?? parsedTime( observation?.observed_on_string );
    return { value: observedAt, id };
  }
  return { value: observation?.id ?? null, id };
}

function compareSortKeys( a: SortKey, b: SortKey, newestFirst: boolean ): number {
  if ( a.value !== b.value ) {
    if ( a.value === null ) return 1;
    if ( b.value === null ) return -1;
    return newestFirst
      ? b.value - a.value
      : a.value - b.value;
  }
  return newestFirst
    ? b.id - a.id
    : a.id - b.id;
}

interface PlaceHeldUploadsParams {
  sort: OBSERVATIONS_SORT;
  // the section's loaded server uuids, in server order
  sectionUuids: string[];
  hasMore: boolean;
  uploadUuids: string[];
  getObservationByUuid: ( uuid: string ) => SortableObservation | null;
}

// Puts held uploads where the server's sort would put them among a section's loaded tiles. One
// already loaded in this section stays where the server put it. One that sorts past the last
// loaded tile is left out while the section has more pages, since it will arrive with a later
// one.
export function placeHeldUploads( {
  sort,
  sectionUuids,
  hasMore,
  uploadUuids,
  getObservationByUuid,
}: PlaceHeldUploadsParams ): string[] {
  if ( uploadUuids.length === 0 ) return sectionUuids;
  const newestFirst = sort === OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST
    || sort === OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST;
  const keyOf = ( uuid: string ) => sortKey( sort, getObservationByUuid( uuid ) );

  const placed = [...sectionUuids];
  uploadUuids.forEach( uuid => {
    if ( placed.includes( uuid ) ) return;
    const uploadKey = keyOf( uuid );
    let low = 0;
    let high = placed.length;
    while ( low < high ) {
      const middle = Math.floor( ( low + high ) / 2 );
      if ( compareSortKeys( keyOf( placed[middle] ), uploadKey, newestFirst ) > 0 ) {
        high = middle;
      } else {
        low = middle + 1;
      }
    }
    if ( low === placed.length && hasMore ) return;
    placed.splice( low, 0, uuid );
  } );
  return placed;
}

interface BuildIconicTaxaRowsParams {
  collapsedCategories: Set<ICONIC_TAXA_GROUP>;
  // most-observed first; drives both section order and header counts
  orderedCounts: IconicTaxaGroupCount[];
  sections: Map<ICONIC_TAXA_GROUP, IconicTaxaSectionState>;
  unsyncedByCategory: Map<ICONIC_TAXA_GROUP, string[]>;
  uploadsByCategory: Map<ICONIC_TAXA_GROUP, string[]>;
  sort: OBSERVATIONS_SORT;
  getObservationByUuid: ( uuid: string ) => SortableObservation | null;
}

// Flattens the sections into the single row list SmallGrid renders.
export function buildIconicTaxaRows( {
  collapsedCategories,
  orderedCounts,
  sections,
  unsyncedByCategory,
  uploadsByCategory,
  sort,
  getObservationByUuid,
}: BuildIconicTaxaRowsParams ): IconicTaxaRow[] {
  // An observation whose taxon was changed locally belongs under its new category while the
  // server still returns it under the old one, so its server copy is dropped from every other
  // section to keep it from rendering twice. Unsynced ones are dropped from their own section
  // too, since they're pinned above it.
  const pinnedUuids = new Set( [...unsyncedByCategory.values( )].flat( ) );
  const uploadCategories = new Map( [...uploadsByCategory].flatMap(
    ( [category, uuids] ) => uuids.map( uuid => [uuid, category] as const ),
  ) );

  return orderedCounts.flatMap( ( { category, count } ): IconicTaxaRow[] => {
    const isOpen = !collapsedCategories.has( category );
    const headerRow: IconicTaxaRow = {
      type: "header",
      key: `header-${category}`,
      header: { category, count, isOpen },
    };
    if ( !isOpen ) return [headerRow];

    const section = sections.get( category );
    const sectionUuids = ( section?.uuids ?? [] ).filter( uuid => !pinnedUuids.has( uuid )
      && ( uploadCategories.get( uuid ) ?? category ) === category );
    const uuids = [
      ...unsyncedByCategory.get( category ) ?? [],
      ...placeHeldUploads( {
        sort,
        sectionUuids,
        hasMore: section?.hasMore ?? count > 0,
        uploadUuids: uploadsByCategory.get( category ) ?? [],
        getObservationByUuid,
      } ),
    ];
    const tileRows: IconicTaxaRow[] = uuids.map( uuid => ( {
      type: "tile",
      key: uuid,
      tile: uuid,
    } ) );

    if ( !section?.isFetching && !section?.isError ) {
      return [headerRow, ...tileRows];
    }

    const kind = section.isError
      ? "error"
      : "loading";
    const spanRow: IconicTaxaRow = {
      type: "span",
      key: `${category}-${kind}`,
      itemType: kind,
      content: { category, kind },
    };
    return [headerRow, ...tileRows, spanRow];
  } );
}

// Where each section starts and ends in the row list, so a caller can tell which section a
// visible row belongs to and how close it is to the end of that section's loaded tiles.
//
// Sections are not necessarily loaded in list order: collapsing a partly-loaded section and
// reopening it later leaves it above sections that have loaded since, so the end of the list
// says nothing about the end of the section the user is actually reading.
export interface IconicTaxaSectionRange {
  category: ICONIC_TAXA_GROUP;
  headerRow: number;
  // last row of the section, whatever its type; equals headerRow when collapsed or empty
  lastRow: number;
  // last tile of the section, or -1 if it has none loaded
  lastTileRow: number;
}

export function sectionRowRanges( rows: IconicTaxaRow[] ): IconicTaxaSectionRange[] {
  const ranges: IconicTaxaSectionRange[] = [];
  rows.forEach( ( row, index ) => {
    if ( row.type === "header" ) {
      ranges.push( {
        category: row.header.category,
        headerRow: index,
        lastRow: index,
        lastTileRow: -1,
      } );
      return;
    }
    const current = ranges[ranges.length - 1];
    if ( !current ) return;
    current.lastRow = index;
    if ( row.type === "tile" ) current.lastTileRow = index;
  } );
  return ranges;
}

export function sectionRangeAtRow(
  ranges: IconicTaxaSectionRange[],
  row: number,
): IconicTaxaSectionRange | undefined {
  return ranges.find( range => row >= range.headerRow && row <= range.lastRow );
}

export type DeepenDecision =
  | { action: "deepen"; category: ICONIC_TAXA_GROUP }
  | { action: "advance" }
  | { action: "wait" };

// Decides what to load when the user nears the end of the section they've landed in.
//
// A fast scroll can overshoot into the never-fetched headers below the section the user was
// reading, so this walks up to the nearest fetched section and lets it decide: deepen it if it
// has more, wait if it errored, advance once it's exhausted. It stops there rather than
// searching further up, since a partly loaded section far above would load off-screen.
export function categoryToDeepen(
  orderedCategories: ICONIC_TAXA_GROUP[],
  sections: Map<ICONIC_TAXA_GROUP, IconicTaxaSectionState>,
  collapsedCategories: Set<ICONIC_TAXA_GROUP>,
  landedOn: ICONIC_TAXA_GROUP,
): DeepenDecision {
  for ( let i = orderedCategories.indexOf( landedOn ); i >= 0; i -= 1 ) {
    const category = orderedCategories[i];
    const section = sections.get( category );
    if ( !collapsedCategories.has( category ) && section?.isActivated ) {
      if ( section.isError ) return { action: "wait" };
      if ( section.hasMore ) return { action: "deepen", category };
      return { action: "advance" };
    }
  }
  return { action: "advance" };
}
