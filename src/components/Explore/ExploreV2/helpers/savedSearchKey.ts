import type { ExploreV2Filters, ExploreV2LocationState } from "providers/ExploreV2Context";
import { EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import type { SavedSearch } from "stores/createExploreV2SearchesSlice";
import { subjectKey } from "stores/createExploreV2SearchesSlice";

// The parts of a search that decide whether two saved searches are the same one. Sort is
// deliberately absent: a row shows subject, location and filter count, so two entries
// differing only in sort order would look identical and read as a duplicate.
export type SavedSearchIdentity = Pick<SavedSearch, "subject" | "location" | "filters">;

const locationKey = ( location: ExploreV2LocationState ): string => {
  switch ( location.placeMode ) {
    case EXPLORE_V2_PLACE_MODE.WORLDWIDE:
      return "worldwide";
    case EXPLORE_V2_PLACE_MODE.NEARBY:
      return "nearby";
    case EXPLORE_V2_PLACE_MODE.PLACE:
      return `place-${location.place.id}`;
    case EXPLORE_V2_PLACE_MODE.MAP_AREA: {
      const {
        swlat, swlng, nelat, nelng,
      } = location.bounds;
      // Rounded so an imperceptible pan doesn't read as a different search
      const corners = [swlat, swlng, nelat, nelng].map( corner => corner.toFixed( 4 ) );
      return `bounds-${corners.join( "," )}`;
    }
    default: {
      const _exhaustive: never = location;
      return _exhaustive;
    }
  }
};

// Typed as a Record of every ExploreV2Filters field, so tsc fails if a new filter is added
// without a value here. A missing field would silently collide two different searches, and
// one would unsave the other. Keys are sorted rather than taken in literal order so the key
// can't shift under us the way Object.keys or JSON.stringify can.
const filtersKey = ( filters: ExploreV2Filters ): string => {
  const parts: Record<keyof ExploreV2Filters, string> = {
    researchGrade: String( filters.researchGrade ),
    needsID: String( filters.needsID ),
    casual: String( filters.casual ),
    hrank: filters.hrank ?? "",
    lrank: filters.lrank ?? "",
    dateObserved: filters.dateObserved,
    observed_on: filters.observed_on ?? "",
    d1: filters.d1 ?? "",
    d2: filters.d2 ?? "",
    months: [...( filters.months ?? [] )].sort( ( a, b ) => a - b ).join( "," ),
    dateUploaded: filters.dateUploaded,
    created_on: filters.created_on ?? "",
    created_d1: filters.created_d1 ?? "",
    created_d2: filters.created_d2 ?? "",
    media: filters.media,
    establishmentMean: filters.establishmentMean,
    wildStatus: filters.wildStatus,
    reviewedFilter: filters.reviewedFilter,
    photoLicense: filters.photoLicense,
    user: String( filters.user?.id ?? "" ),
    excludeUser: String( filters.excludeUser?.id ?? "" ),
    project: String( filters.project?.id ?? "" ),
  };

  return ( Object.keys( parts ) as ( keyof ExploreV2Filters )[] )
    .sort( )
    .map( field => `${field}=${parts[field]}` )
    .join( ";" );
};

const savedSearchKey = ( search: SavedSearchIdentity ): string => [
  search.subject
    ? subjectKey( search.subject )
    : "none",
  locationKey( search.location ),
  filtersKey( search.filters ),
].join( "|" );

export default savedSearchKey;
