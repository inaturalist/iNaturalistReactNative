import type { ExploreV2Filters } from "providers/ExploreV2Context";
import { defaultExploreV2Filters } from "providers/ExploreV2Context";

const countedDefaults = {
  ...defaultExploreV2Filters,
  user: null,
  excludeUser: null,
  project: null,
};

type CountedKey = keyof typeof countedDefaults;

// compare against default filters and count differences
function countFilters( filters: ExploreV2Filters ): number {
  const count = ( Object.keys( countedDefaults ) as CountedKey[] ).reduce(
    ( memo, key ) => (
      ( filters[key] ?? null ) === countedDefaults[key]
        ? memo
        : memo + 1
    ),
    0,
  );
  // Ranks are one filter in the UI, so a high and a low rank still count once
  if ( filters.hrank && filters.lrank ) { return count - 1; }
  return count;
}

export default countFilters;
