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

// A first-time upload whose section hasn't loaded its server copy yet
export interface HeldUpload {
  uuid: string;
  // YYYY-MM-DD, or null if it has no date
  observedOn: string | null;
}

interface PlaceHeldUploadsParams {
  sort: OBSERVATIONS_SORT;
  // the section's loaded server uuids, in server order
  sectionUuids: string[];
  hasMore: boolean;
  // newest first
  uploads: HeldUpload[];
  // a loaded observation's observed date, as YYYY-MM-DD
  observedOnOf: ( uuid: string ) => string | null;
}

// Puts held uploads where the current sort would put them among a section's loaded tiles. One
// that sorts past the last loaded tile is left out while the section has more pages, since it
// will arrive with a later one.
//
// The server orders observed dates by day only, so same-day ties are a guess: a new upload goes
// first among its day's tiles when newest-first, and last when oldest-first. Observations with no
// date sort last either way.
export function placeHeldUploads( {
  sort,
  sectionUuids,
  hasMore,
  uploads,
  observedOnOf,
}: PlaceHeldUploadsParams ): string[] {
  if ( uploads.length === 0 ) return sectionUuids;
  const uploadUuids = uploads.map( ( { uuid } ) => uuid );

  if ( sort === OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST ) {
    // A new upload is the newest observation the user has, so it belongs at the very end
    return hasMore
      ? sectionUuids
      : [...sectionUuids, ...uploadUuids.reverse( )];
  }
  if (
    sort !== OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST
    && sort !== OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST
  ) {
    return [...uploadUuids, ...sectionUuids];
  }

  const newestFirst = sort === OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST;
  const uploadDays = new Map( uploads.map( ( { uuid, observedOn } ) => [uuid, observedOn] ) );
  const dayOf = ( uuid: string ) => ( uploadDays.has( uuid )
    ? uploadDays.get( uuid ) ?? null
    : observedOnOf( uuid ) );
  // Whether a tile belongs after the given upload day.
  const sortsAfter = ( tileDay: string | null, uploadDay: string ) => {
    if ( tileDay === null ) return true;
    return newestFirst
      ? tileDay <= uploadDay
      : tileDay > uploadDay;
  };

  const placed = [...sectionUuids];
  uploads.forEach( ( { uuid, observedOn } ) => {
    let index = placed.length;
    if ( observedOn !== null ) {
      let low = 0;
      let high = placed.length;
      while ( low < high ) {
        const middle = Math.floor( ( low + high ) / 2 );
        if ( sortsAfter( dayOf( placed[middle] ), observedOn ) ) {
          high = middle;
        } else {
          low = middle + 1;
        }
      }
      index = low;
    }
    if ( index === placed.length && hasMore ) return;
    placed.splice( index, 0, uuid );
  } );
  return placed;
}

interface BuildIconicTaxaRowsParams {
  collapsedCategories: Set<ICONIC_TAXA_GROUP>;
  // most-observed first; drives both section order and header counts
  orderedCounts: IconicTaxaGroupCount[];
  sections: Map<ICONIC_TAXA_GROUP, IconicTaxaSectionState>;
  unsyncedByCategory: Map<ICONIC_TAXA_GROUP, string[]>;
  uploadsByCategory?: Map<ICONIC_TAXA_GROUP, HeldUpload[]>;
  sort?: OBSERVATIONS_SORT;
  observedOnOf?: ( uuid: string ) => string | null;
}

// Flattens the sections into the single row list SmallGrid renders.
export function buildIconicTaxaRows( {
  collapsedCategories,
  orderedCounts,
  sections,
  unsyncedByCategory,
  uploadsByCategory = new Map( ),
  sort = OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
  observedOnOf = ( ) => null,
}: BuildIconicTaxaRowsParams ): IconicTaxaRow[] {
  // Deduped against every category's pins, not just this section's: an observation whose taxon
  // was changed locally is pinned under its new category while the server still returns it
  // under the old one, so a per-section check would render it twice in two different sections.
  const pinnedUuids = new Set( [...unsyncedByCategory.values( )].flat( ) );

  return orderedCounts.flatMap( ( { category, count } ): IconicTaxaRow[] => {
    const isOpen = !collapsedCategories.has( category );
    const headerRow: IconicTaxaRow = {
      type: "header",
      key: `header-${category}`,
      header: { category, count, isOpen },
    };
    if ( !isOpen ) return [headerRow];

    const section = sections.get( category );
    const uuids = [
      ...unsyncedByCategory.get( category ) ?? [],
      ...placeHeldUploads( {
        sort,
        sectionUuids: ( section?.uuids ?? [] ).filter( uuid => !pinnedUuids.has( uuid ) ),
        hasMore: section?.hasMore ?? count > 0,
        uploads: uploadsByCategory.get( category ) ?? [],
        observedOnOf,
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
