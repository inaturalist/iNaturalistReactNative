import type {
  SortDirection,
  SpeciesCount,
  SpeciesSort,
  SpeciesSortBy,
} from "types/sorting";

import { SPECIES_SORT_BY } from "../types/sorting";

const SPECIES_SORT_MAP: Record<SPECIES_SORT_BY, SpeciesSort> = {
  [SPECIES_SORT_BY.COUNT_DESC]: { by: "count", direction: "desc" },
  [SPECIES_SORT_BY.COUNT_ASC]: { by: "count", direction: "asc" },
};

/**
 * Maps selected species sort option to API params
 * Returns null if the sort should be done client-side
 * @param sortOptionId: the selected sort option
 */
export function mapSpeciesSortToAPIParams(
  sortOptionId: SPECIES_SORT_BY,
): { order_by: SpeciesSortBy; order: SortDirection } | null {
  const sortConfig = SPECIES_SORT_MAP[sortOptionId];
  if ( !sortConfig ) {
    return null;
  }

  switch ( sortConfig.by ) {
    case "count":
      return {
        order_by: "count",
        order: sortConfig.direction || "desc",
      };
    default:
      return null;
  }
}

/**
 * Sorts an array of species counts based on the provided sort option
 * @param speciesCounts: array of SpeciesCounts to be sorted
 * @param sortOptionId: the selected sort option
 */
export function sortSpeciesCounts<T extends SpeciesCount>(
  speciesCounts: T[],
  sortOptionId: SPECIES_SORT_BY,
): T[] {
  const sortConfig = SPECIES_SORT_MAP[sortOptionId];
  if ( !sortConfig ) {
    return speciesCounts;
  }

  const sorted = [...speciesCounts];

  switch ( sortConfig.by ) {
    case "count": {
      sorted.sort( ( a, b ) => {
        const diff = a.count - b.count;
        return sortConfig.direction === "asc"
          ? diff
          : -diff;
      } );
      break;
    }
    default:
      break;
  }

  return sorted;
}
