import {
  getDateObservedValues,
  getDateUploadedValues,
  getEstablishmentValues,
  getMediaValues,
  getMonthValues,
  getPhotoLicenseValues,
  getReviewedValues,
  getSortByValues,
  getTaxonomicRankValues,
  getWildValues,
} from "components/Explore/ExploreV2/helpers/advancedSearchOptions";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
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

beforeAll( async ( ) => {
  await initI18next( );
} );

const t = ( ...args ) => i18next.t( ...args );

describe( "advanced search option lists", ( ) => {
  it.each( [
    ["getSortByValues", getSortByValues, OBSERVATIONS_SORT],
    ["getTaxonomicRankValues", getTaxonomicRankValues, TAXONOMIC_RANK],
    ["getDateObservedValues", getDateObservedValues, DATE_OBSERVED],
    ["getDateUploadedValues", getDateUploadedValues, DATE_UPLOADED],
    ["getMediaValues", getMediaValues, MEDIA],
    ["getEstablishmentValues", getEstablishmentValues, ESTABLISHMENT_MEAN],
    ["getWildValues", getWildValues, WILD_STATUS],
    ["getReviewedValues", getReviewedValues, REVIEWED],
    ["getPhotoLicenseValues", getPhotoLicenseValues, PHOTO_LICENSE],
  ] )( "%s covers every value, keyed by value, with a label", ( _name, getValues, values ) => {
    const options = getValues( t );

    expect( Object.keys( options ) ).toEqual( Object.values( values ) );
    Object.keys( options ).forEach( key => {
      expect( String( options[key].value ) ).toEqual( key );
      expect( options[key].label ).toBeTruthy( );
    } );
  } );

  it( "gives a sort order a two-line sheet label and a caps label", ( ) => {
    const values = getSortByValues( t );

    expect( values[OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST] ).toMatchObject( {
      label: "Date observed",
      labelCaps: "DATE OBSERVED - OLDEST TO NEWEST",
      text: "Oldest to newest",
    } );
  } );

  it( "keys all twelve months by their month number", ( ) => {
    const values = getMonthValues( t );

    expect( Object.keys( values ).map( Number ) ).toEqual( [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ] );
    expect( values[1].label ).toEqual( "January" );
    expect( values[12].label ).toEqual( "December" );
  } );
} );
