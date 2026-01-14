import type {
  ObservationSort, ObservationSortOptionId, SpeciesCount, SpeciesSort, SpeciesSortOptionId,
} from "types/sorting";

export const OBSERVATION_SORT_MAP: Record<
  ObservationSortOptionId,
  ObservationSort
> = {
  created_at_desc: {
    by: "created_at",
    direction: "desc",
  },
  created_at_asc: {
    by: "created_at",
    direction: "asc",
  },
  observed_at_desc: {
    by: "observed_at",
    direction: "desc",
  },
  observed_at_asc: {
    by: "observed_at",
    direction: "asc",
  },
};

export const SPECIES_SORT_MAP: Record<SpeciesSortOptionId, SpeciesSort> = {
  count_desc: { by: "count", direction: "desc" },
  count_asc: { by: "count", direction: "asc" },
};

/**
 * Maps selected species sort option to API params
 * Returns null if the sort should be done client-side
 * @param sortOptionId: the selected sort option
 */
export function mapSpeciesSortToAPIParams(
  sortOptionId: SpeciesSortOptionId,
): { order_by?: string; order?: string } | null {
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
  sortOptionId: SpeciesSortOptionId,
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
