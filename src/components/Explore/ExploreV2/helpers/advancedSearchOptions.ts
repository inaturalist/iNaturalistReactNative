import type { TFunction } from "i18next";
import {
  DATE_OBSERVED,
  DATE_UPLOADED,
  ESTABLISHMENT_MEAN,
  MEDIA,
  PHOTO_LICENSE,
  REVIEWED,
  TAXONOMIC_RANK,
  WILD_STATUS,
} from "providers/ExploreContext";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";

export interface FilterOption<ValueT> {
  label: string;
  value: ValueT;
}
const option = <ValueT extends string | number>(
  value: ValueT,
  label: string,
): [ValueT, FilterOption<ValueT>] => [value, { label, value }];

// `label` / `text` are the two lines of each row in the sort sheet; `labelCaps`
// is the single-line, all-caps version in the dropdown button
export const getSortByValues = ( t: TFunction ) => ( {
  [OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST]: {
    label: t( "Date-uploaded" ),
    labelCaps: t( "DATE-UPLOADED-NEWEST" ),
    text: t( "Newest-to-oldest" ),
    value: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
  },
  [OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST]: {
    label: t( "Date-uploaded" ),
    labelCaps: t( "DATE-UPLOADED-OLDEST" ),
    text: t( "Oldest-to-newest" ),
    value: OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST,
  },
  [OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST]: {
    label: t( "Date-observed" ),
    labelCaps: t( "DATE-OBSERVED-NEWEST" ),
    text: t( "Newest-to-oldest" ),
    value: OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST,
  },
  [OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST]: {
    label: t( "Date-observed" ),
    labelCaps: t( "DATE-OBSERVED-OLDEST" ),
    text: t( "Oldest-to-newest" ),
    value: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
  },
} );

export const getTaxonomicRankValues = ( t: TFunction ) => Object.fromEntries( [
  option( TAXONOMIC_RANK.none, t( "NONE--ranks" ) ),
  option( TAXONOMIC_RANK.kingdom, t( "Ranks-KINGDOM" ) ),
  option( TAXONOMIC_RANK.phylum, t( "Ranks-PHYLUM" ) ),
  option( TAXONOMIC_RANK.subphylum, t( "Ranks-SUBPHYLUM" ) ),
  option( TAXONOMIC_RANK.superclass, t( "Ranks-SUPERCLASS" ) ),
  option( TAXONOMIC_RANK.class, t( "Ranks-CLASS" ) ),
  option( TAXONOMIC_RANK.subclass, t( "Ranks-SUBCLASS" ) ),
  option( TAXONOMIC_RANK.infraclass, t( "Ranks-INFRACLASS" ) ),
  option( TAXONOMIC_RANK.subterclass, t( "Ranks-SUBTERCLASS" ) ),
  option( TAXONOMIC_RANK.superorder, t( "Ranks-SUPERORDER" ) ),
  option( TAXONOMIC_RANK.order, t( "Ranks-ORDER" ) ),
  option( TAXONOMIC_RANK.suborder, t( "Ranks-SUBORDER" ) ),
  option( TAXONOMIC_RANK.infraorder, t( "Ranks-INFRAORDER" ) ),
  option( TAXONOMIC_RANK.parvorder, t( "Ranks-PARVORDER" ) ),
  option( TAXONOMIC_RANK.zoosection, t( "Ranks-ZOOSECTION" ) ),
  option( TAXONOMIC_RANK.zoosubsection, t( "Ranks-ZOOSUBSECTION" ) ),
  option( TAXONOMIC_RANK.superfamily, t( "Ranks-SUPERFAMILY" ) ),
  option( TAXONOMIC_RANK.epifamily, t( "Ranks-EPIFAMILY" ) ),
  option( TAXONOMIC_RANK.family, t( "Ranks-FAMILY" ) ),
  option( TAXONOMIC_RANK.subfamily, t( "Ranks-SUBFAMILY" ) ),
  option( TAXONOMIC_RANK.supertribe, t( "Ranks-SUPERTRIBE" ) ),
  option( TAXONOMIC_RANK.tribe, t( "Ranks-TRIBE" ) ),
  option( TAXONOMIC_RANK.subtribe, t( "Ranks-SUBTRIBE" ) ),
  option( TAXONOMIC_RANK.genus, t( "Ranks-GENUS" ) ),
  option( TAXONOMIC_RANK.genushybrid, t( "Ranks-GENUSHYBRID" ) ),
  option( TAXONOMIC_RANK.subgenus, t( "Ranks-SUBGENUS" ) ),
  option( TAXONOMIC_RANK.section, t( "Ranks-SECTION" ) ),
  option( TAXONOMIC_RANK.subsection, t( "Ranks-SUBSECTION" ) ),
  option( TAXONOMIC_RANK.complex, t( "Ranks-COMPLEX" ) ),
  option( TAXONOMIC_RANK.species, t( "Ranks-SPECIES" ) ),
  option( TAXONOMIC_RANK.hybrid, t( "Ranks-HYBRID" ) ),
  option( TAXONOMIC_RANK.subspecies, t( "Ranks-SUBSPECIES" ) ),
  option( TAXONOMIC_RANK.variety, t( "Ranks-VARIETY" ) ),
  option( TAXONOMIC_RANK.form, t( "Ranks-FORM" ) ),
  option( TAXONOMIC_RANK.infrahybrid, t( "Ranks-INFRAHYBRID" ) ),
] );

export const getDateObservedValues = ( t: TFunction ) => ( {
  [DATE_OBSERVED.ALL]: {
    label: t( "All" ),
    labelCaps: t( "ALL" ),
    value: DATE_OBSERVED.ALL,
  },
  [DATE_OBSERVED.EXACT_DATE]: {
    label: t( "Exact-Date" ),
    labelCaps: t( "EXACT-DATE" ),
    text: t( "Filter-by-observed-on-date" ),
    value: DATE_OBSERVED.EXACT_DATE,
  },
  [DATE_OBSERVED.DATE_RANGE]: {
    label: t( "Date-Range" ),
    labelCaps: t( "DATE-RANGE" ),
    text: t( "Filter-by-observed-between-dates" ),
    value: DATE_OBSERVED.DATE_RANGE,
  },
  [DATE_OBSERVED.MONTHS]: {
    label: t( "Months" ),
    labelCaps: t( "MONTHS" ),
    text: t( "Filter-by-observed-during-months" ),
    value: DATE_OBSERVED.MONTHS,
  },
} );

export const getDateUploadedValues = ( t: TFunction ) => ( {
  [DATE_UPLOADED.ALL]: {
    label: t( "All" ),
    labelCaps: t( "ALL" ),
    value: DATE_UPLOADED.ALL,
  },
  [DATE_UPLOADED.EXACT_DATE]: {
    label: t( "Exact-Date" ),
    labelCaps: t( "EXACT-DATE" ),
    text: t( "Filter-by-uploaded-on-date" ),
    value: DATE_UPLOADED.EXACT_DATE,
  },
  [DATE_UPLOADED.DATE_RANGE]: {
    label: t( "Date-Range" ),
    labelCaps: t( "DATE-RANGE" ),
    text: t( "Filter-by-uploaded-between-dates" ),
    value: DATE_UPLOADED.DATE_RANGE,
  },
} );

export const getMonthValues = ( t: TFunction ) => Object.fromEntries( [
  option( 1, t( "January" ) ),
  option( 2, t( "February" ) ),
  option( 3, t( "March" ) ),
  option( 4, t( "April" ) ),
  option( 5, t( "May" ) ),
  option( 6, t( "June" ) ),
  option( 7, t( "July" ) ),
  option( 8, t( "August" ) ),
  option( 9, t( "September" ) ),
  option( 10, t( "October" ) ),
  option( 11, t( "November" ) ),
  option( 12, t( "December" ) ),
] );

export const getMediaValues = ( t: TFunction ) => Object.fromEntries( [
  option( MEDIA.ALL, t( "All" ) ),
  option( MEDIA.PHOTOS, t( "Photos" ) ),
  option( MEDIA.SOUNDS, t( "Sounds" ) ),
  option( MEDIA.NONE, t( "No-Media" ) ),
] );

export const getEstablishmentValues = ( t: TFunction ) => Object.fromEntries( [
  option( ESTABLISHMENT_MEAN.ANY, t( "Any--establishment-means" ) ),
  option( ESTABLISHMENT_MEAN.INTRODUCED, t( "Introduced" ) ),
  option( ESTABLISHMENT_MEAN.NATIVE, t( "Native" ) ),
  option( ESTABLISHMENT_MEAN.ENDEMIC, t( "Endemic" ) ),
] );

export const getWildValues = ( t: TFunction ) => Object.fromEntries( [
  option( WILD_STATUS.ALL, t( "All" ) ),
  option( WILD_STATUS.WILD, t( "Wild" ) ),
  option( WILD_STATUS.CAPTIVE, t( "Captive-Cultivated" ) ),
] );

export const getReviewedValues = ( t: TFunction ) => Object.fromEntries( [
  option( REVIEWED.ALL, t( "All-observations" ) ),
  option( REVIEWED.REVIEWED, t( "Reviewed-observations-only" ) ),
  option( REVIEWED.UNREVIEWED, t( "Unreviewed-observations-only" ) ),
] );

export const getPhotoLicenseValues = ( t: TFunction ) => Object.fromEntries( [
  option( PHOTO_LICENSE.ALL, t( "ALL" ) ),
  option( PHOTO_LICENSE.CC0, t( "CC0" ) ),
  option( PHOTO_LICENSE.CCBY, t( "CC-BY" ) ),
  option( PHOTO_LICENSE.CCBYNC, t( "CC-BY-NC" ) ),
  option( PHOTO_LICENSE.CCBYSA, t( "CC-BY-SA" ) ),
  option( PHOTO_LICENSE.CCBYND, t( "CC-BY-ND" ) ),
  option( PHOTO_LICENSE.CCBYNCSA, t( "CC-BY-NC-SA" ) ),
  option( PHOTO_LICENSE.CCBYNCND, t( "CC-BY-NC-ND" ) ),
] );
