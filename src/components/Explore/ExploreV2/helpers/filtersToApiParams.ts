import {
  ESTABLISHMENT_MEAN,
  MEDIA,
  PHOTO_LICENSE,
  REVIEWED,
  WILD_STATUS,
} from "providers/ExploreContext";
import type { ExploreV2Filters } from "providers/ExploreV2Context";

// Maps the typed AdvancedSearch filters to iNat API query params.
export interface FilterApiParams {
  quality_grade?: string[];
  hrank?: string;
  lrank?: string;
  observed_on?: string;
  d1?: string;
  d2?: string;
  month?: number[];
  created_on?: string;
  created_d1?: string;
  created_d2?: string;
  photos?: boolean;
  sounds?: boolean;
  native?: boolean;
  introduced?: boolean;
  endemic?: boolean;
  captive?: boolean;
  reviewed?: boolean;
  viewer_id?: number;
  photo_license?: string;
  iconic_taxa?: string[];
  user_id?: number;
  project_id?: number;
}

const PHOTO_LICENSE_PARAMS: Partial<Record<PHOTO_LICENSE, string>> = {
  [PHOTO_LICENSE.CC0]: "cc0",
  [PHOTO_LICENSE.CCBY]: "cc-by",
  [PHOTO_LICENSE.CCBYNC]: "cc-by-nc",
  [PHOTO_LICENSE.CCBYSA]: "cc-by-sa",
  [PHOTO_LICENSE.CCBYND]: "cc-by-nd",
  [PHOTO_LICENSE.CCBYNCSA]: "cc-by-nc-sa",
  [PHOTO_LICENSE.CCBYNCND]: "cc-by-nc-nd",
};

const filtersToApiParams = (
  filters: ExploreV2Filters,
  viewerId?: number | null,
): FilterApiParams => {
  const params: FilterApiParams = {};

  const qualityGrade: string[] = [];
  if ( filters.researchGrade ) { qualityGrade.push( "research" ); }
  if ( filters.needsID ) { qualityGrade.push( "needs_id" ); }
  if ( filters.casual ) { qualityGrade.push( "casual" ); }
  if ( qualityGrade.length > 0 ) { params.quality_grade = qualityGrade; }

  if ( filters.hrank ) { params.hrank = filters.hrank; }
  if ( filters.lrank ) { params.lrank = filters.lrank; }

  if ( filters.observed_on ) { params.observed_on = filters.observed_on; }
  if ( filters.d1 ) { params.d1 = filters.d1; }
  if ( filters.d2 ) { params.d2 = filters.d2; }
  if ( filters.months && filters.months.length > 0 ) { params.month = filters.months; }

  if ( filters.created_on ) { params.created_on = filters.created_on; }
  if ( filters.created_d1 ) { params.created_d1 = filters.created_d1; }
  if ( filters.created_d2 ) { params.created_d2 = filters.created_d2; }

  if ( filters.media === MEDIA.PHOTOS ) {
    params.photos = true;
  } else if ( filters.media === MEDIA.SOUNDS ) {
    params.sounds = true;
  } else if ( filters.media === MEDIA.NONE ) {
    params.photos = false;
    params.sounds = false;
  }

  if ( filters.establishmentMean === ESTABLISHMENT_MEAN.NATIVE ) {
    params.native = true;
  } else if ( filters.establishmentMean === ESTABLISHMENT_MEAN.INTRODUCED ) {
    params.introduced = true;
  } else if ( filters.establishmentMean === ESTABLISHMENT_MEAN.ENDEMIC ) {
    params.endemic = true;
  }

  if ( filters.wildStatus === WILD_STATUS.WILD ) {
    params.captive = false;
  } else if ( filters.wildStatus === WILD_STATUS.CAPTIVE ) {
    params.captive = true;
  }

  if ( filters.reviewedFilter === REVIEWED.REVIEWED && viewerId ) {
    params.reviewed = true;
    params.viewer_id = viewerId;
  } else if ( filters.reviewedFilter === REVIEWED.UNREVIEWED && viewerId ) {
    params.reviewed = false;
    params.viewer_id = viewerId;
  }

  if ( filters.photoLicense !== PHOTO_LICENSE.ALL ) {
    const license = PHOTO_LICENSE_PARAMS[filters.photoLicense];
    if ( license ) { params.photo_license = license; }
  }

  if ( filters.iconic_taxa && filters.iconic_taxa.length > 0 ) {
    params.iconic_taxa = filters.iconic_taxa;
  }

  if ( filters.user?.id ) { params.user_id = filters.user.id; }
  if ( filters.project?.id ) { params.project_id = filters.project.id; }

  return params;
};

export default filtersToApiParams;
