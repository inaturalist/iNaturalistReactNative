import countFilters from "components/Explore/ExploreV2/helpers/countFilters";
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
import { defaultExploreV2Filters } from "providers/ExploreV2Context";
import factory from "tests/factory";

const withFilters = overrides => ( { ...defaultExploreV2Filters, ...overrides } );

describe( "countFilters", ( ) => {
  it( "counts nothing for the default search", ( ) => {
    expect( countFilters( defaultExploreV2Filters ) ).toEqual( 0 );
  } );

  it.each( [
    ["an unchecked quality grade", { needsID: false }],
    ["casual observations", { casual: true }],
    ["a media type", { media: MEDIA.PHOTOS }],
    ["an establishment means", { establishmentMean: ESTABLISHMENT_MEAN.NATIVE }],
    ["a wild status", { wildStatus: WILD_STATUS.WILD }],
    ["reviewed observations", { reviewedFilter: REVIEWED.REVIEWED }],
    ["a photo license", { photoLicense: PHOTO_LICENSE.CC0 }],
    ["a taxonomic rank", { hrank: TAXONOMIC_RANK.family }],
  ] )( "counts %s", ( _name, filters ) => {
    expect( countFilters( withFilters( filters ) ) ).toEqual( 1 );
  } );

  it.each( [
    ["a user", "user"],
    ["an excluded user", "excludeUser"],
  ] )( "counts %s", ( _name, key ) => {
    const user = factory( "RemoteUser" );
    expect( countFilters( withFilters( { [key]: user } ) ) ).toEqual( 1 );
  } );

  it( "counts a project", ( ) => {
    const project = factory( "RemoteProject" );
    expect( countFilters( withFilters( { project } ) ) ).toEqual( 1 );
  } );

  it( "counts a high and a low rank as one filter", ( ) => {
    const ranks = { hrank: TAXONOMIC_RANK.family, lrank: TAXONOMIC_RANK.species };
    expect( countFilters( withFilters( ranks ) ) ).toEqual( 1 );
  } );

  it( "counts a date range as one filter, not one per date", ( ) => {
    const observedRange = {
      dateObserved: DATE_OBSERVED.EXACT_DATE,
      d1: "2024-01-01",
      d2: "2024-02-01",
    };
    expect( countFilters( withFilters( observedRange ) ) ).toEqual( 1 );
  } );

  it( "counts every changed filter", ( ) => {
    const filters = withFilters( {
      casual: true,
      dateObserved: DATE_OBSERVED.MONTHS,
      months: [1, 2],
      dateUploaded: DATE_UPLOADED.EXACT_DATE,
      created_on: "2024-01-01",
      media: MEDIA.SOUNDS,
    } );

    expect( countFilters( filters ) ).toEqual( 4 );
  } );
} );
