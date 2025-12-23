// @flow

import {
  ESTABLISHMENT_MEAN,
  MEDIA,
  PHOTO_LICENSE,
  REVIEWED,
  SORT_BY,
  WILD_STATUS,
} from "providers/ExploreContext";

const mapParamsToAPI = ( params: Object, currentUser: Object ): Object => {
  const RESEARCH = "research";
  const NEEDS_ID = "needs_id";
  const CASUAL = "casual";

  const CREATED_AT = "created_at"; // = date uploaded at
  const OBSERVED_ON = "observed_on";
  const VOTES = "votes";

  const DESC = "desc";
  const ASC = "asc";

  // Remove all params that are falsy
  const filteredParams = Object.entries( params ).reduce(
    ( newParams, [key, value] ) => {
      if ( value ) {
        newParams[key] = value;
      }
      return newParams;
    },
    {},
  );

  // DATE_UPLOADED_NEWEST is the default sort order
  filteredParams.order_by = CREATED_AT;
  filteredParams.order = DESC;
  if ( params.sortBy === SORT_BY.DATE_UPLOADED_OLDEST ) {
    filteredParams.order_by = CREATED_AT;
    filteredParams.order = ASC;
  }
  if ( params.sortBy === SORT_BY.DATE_OBSERVED_NEWEST ) {
    filteredParams.order_by = OBSERVED_ON;
    filteredParams.order = DESC;
  }
  if ( params.sortBy === SORT_BY.DATE_OBSERVED_OLDEST ) {
    filteredParams.order_by = OBSERVED_ON;
    filteredParams.order = ASC;
  }
  if ( params.sortBy === SORT_BY.MOST_FAVED ) {
    filteredParams.order_by = VOTES;
    filteredParams.order = DESC;
  }

  filteredParams.quality_grade = [];
  if ( params.researchGrade ) {
    filteredParams.quality_grade.push( RESEARCH );
  }
  if ( params.needsID ) {
    filteredParams.quality_grade.push( NEEDS_ID );
  }
  if ( params.casual ) {
    filteredParams.quality_grade.push( CASUAL );
    delete filteredParams.verifiable;
  }

  if ( filteredParams.months ) {
    filteredParams.month = filteredParams.months;
    delete filteredParams.months;
  }

  // MEDIA.ALL is the default media filter and for it we don't need to pass any params
  if ( params.media === MEDIA.PHOTOS ) {
    filteredParams.photos = true;
  } else if ( params.media === MEDIA.SOUNDS ) {
    filteredParams.sounds = true;
  } else if ( params.media === MEDIA.NONE ) {
    filteredParams.photos = false;
    filteredParams.sounds = false;
  }

  // ESTABLISHMENT_MEAN.ANY is the default here and for it we don't need to pass any params
  if ( params.establishmentMean === ESTABLISHMENT_MEAN.NATIVE ) {
    filteredParams.native = true;
  } else if ( params.establishmentMean === ESTABLISHMENT_MEAN.INTRODUCED ) {
    filteredParams.introduced = true;
  } else if ( params.establishmentMean === ESTABLISHMENT_MEAN.ENDEMIC ) {
    filteredParams.endemic = true;
  }

  if ( params.wildStatus === WILD_STATUS.WILD ) {
    filteredParams.captive = false;
  } else if ( params.wildStatus === WILD_STATUS.CAPTIVE ) {
    filteredParams.captive = true;
  }

  if ( params.reviewedFilter === REVIEWED.REVIEWED ) {
    filteredParams.reviewed = true;
    filteredParams.viewer_id = currentUser?.id;
  } else if ( params.reviewedFilter === REVIEWED.UNREVIEWED ) {
    filteredParams.reviewed = false;
    filteredParams.viewer_id = currentUser?.id;
  }

  if ( params.photoLicense !== PHOTO_LICENSE.ALL ) {
    // How license filter maps to the API
    const licenseParams = {
      [PHOTO_LICENSE.CC0]: "cc0",
      [PHOTO_LICENSE.CCBY]: "cc-by",
      [PHOTO_LICENSE.CCBYNC]: "cc-by-nc",
      [PHOTO_LICENSE.CCBYSA]: "cc-by-sa",
      [PHOTO_LICENSE.CCBYND]: "cc-by-nd",
      [PHOTO_LICENSE.CCBYNCSA]: "cc-by-nc-sa",
      [PHOTO_LICENSE.CCBYNCND]: "cc-by-nc-nd",
    };
    filteredParams.photo_license = licenseParams[params.photoLicense];
  }

  delete filteredParams.taxon;
  delete filteredParams.place_guess;
  delete filteredParams.placeMode;
  delete filteredParams.user;
  delete filteredParams.project;
  delete filteredParams.sortBy;
  delete filteredParams.researchGrade;
  delete filteredParams.needsID;
  delete filteredParams.casual;
  delete filteredParams.dateObserved;
  delete filteredParams.dateUploaded;
  delete filteredParams.media;
  delete filteredParams.establishmentMean;
  delete filteredParams.wildStatus;
  delete filteredParams.reviewedFilter;
  delete filteredParams.photoLicense;
  delete filteredParams.place;

  return filteredParams;
};

export default mapParamsToAPI;
