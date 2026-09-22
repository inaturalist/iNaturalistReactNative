import type { SmallGridItem } from "components/SharedComponents/SmallGrid";
import type { ICONIC_TAXA_GROUP, IconicTaxaGroupCount } from "sharedHelpers/iconicTaxaGroupOrder";

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

interface BuildIconicTaxaRowsParams {
  collapsedCategories: Set<ICONIC_TAXA_GROUP>;
  // most-observed first; drives both section order and header counts
  orderedCounts: IconicTaxaGroupCount[];
  sections: Map<ICONIC_TAXA_GROUP, IconicTaxaSectionState>;
  unsyncedByCategory: Map<ICONIC_TAXA_GROUP, string[]>;
}

// Flattens the sections into the single row list SmallGrid renders.
export function buildIconicTaxaRows( {
  collapsedCategories,
  orderedCounts,
  sections,
  unsyncedByCategory,
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
      ...( section?.uuids ?? [] ).filter( uuid => !pinnedUuids.has( uuid ) ),
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
