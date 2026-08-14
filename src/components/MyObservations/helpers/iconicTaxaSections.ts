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

// Index of the last tile in the list, which is where the observations a user can actually
// scroll through run out.
//
// This is not the end of the list: every category renders a header whether or not it has been
// fetched, so below the last tile sits a stack of headers for categories that haven't loaded
// yet. Waiting for onEndReached would mean waiting for the user to scroll past all of those
// first, so paging triggers off this instead.
export function lastTileRowIndex( rows: IconicTaxaRow[] ): number {
  for ( let index = rows.length - 1; index >= 0; index -= 1 ) {
    if ( rows[index].type === "tile" ) return index;
  }
  return -1;
}

// determines which section should load its next page when the user reaches the bottom of the list.
// Returns null when the deepest section is exhausted, which is the caller's signal to activate the
// next category instead.
//
// Also returns null while anything is fetching, which serializes requests and acts as the guard
// against FlashList firing onEndReached repeatedly through a single overscroll.
export function selectCategoryToDeepen(
  orderedCategories: ICONIC_TAXA_GROUP[],
  sections: Map<ICONIC_TAXA_GROUP, IconicTaxaSectionState>,
  collapsedCategories: Set<ICONIC_TAXA_GROUP>,
): ICONIC_TAXA_GROUP | null {
  if ( [...sections.values( )].some( section => section.isFetching ) ) return null;

  for ( let i = orderedCategories.length - 1; i >= 0; i -= 1 ) {
    const category = orderedCategories[i];
    const section = sections.get( category );
    const canDeepen = section?.isActivated
      && section.hasMore
      && !section.isError
      && !collapsedCategories.has( category );
    if ( canDeepen ) return category;
  }
  return null;
}
