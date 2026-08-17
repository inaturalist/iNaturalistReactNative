import { OBSERVATIONS_TAB } from "appConstants/tabs";
import {
  advancedSearchReducer,
  draftFromV2State,
} from "components/Explore/ExploreV2/helpers/advancedSearchReducer";
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
import {
  defaultExploreV2Filters,
  EXPLORE_V2_PLACE_MODE,
} from "providers/ExploreV2Context";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";
import factory from "tests/factory";

const TAXON = {
  id: 745,
  name: "Silphium perfoliatum",
  preferred_common_name: "Cup Plant",
  rank: "species",
  rank_level: 10,
};

const USER = factory( "RemoteUser", { id: 7, login: "seth_msp" } );
const OTHER_USER = factory( "RemoteUser", { id: 8, login: "kueda" } );
const PROJECT = factory( "RemoteProject", {
  id: 9,
  title: "InverteFest",
  project_type: "collection",
} );
const PLACE = { id: 1, display_name: "Monterey, CA, US" };

const makeDraft = ( { filters, ...overrides } = {} ) => ( {
  subject: null,
  location: { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY },
  sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
  filters: { ...defaultExploreV2Filters, ...filters },
  ...overrides,
} );

const makeV2State = ( overrides = {} ) => ( {
  subject: { type: "taxon", taxon: TAXON },
  location: { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place: PLACE },
  sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
  speciesSortBy: SPECIES_SORT.COUNT_DESC,
  filters: defaultExploreV2Filters,
  activeTab: OBSERVATIONS_TAB,
  ...overrides,
} );

describe( "draftFromV2State", ( ) => {
  it( "copies only the parts of explore state that advanced search edits", ( ) => {
    const v2State = makeV2State( {
      filters: { ...defaultExploreV2Filters, casual: true },
    } );

    expect( draftFromV2State( v2State ) ).toEqual( {
      subject: { type: "taxon", taxon: TAXON },
      location: { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place: PLACE },
      sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
      filters: { ...defaultExploreV2Filters, casual: true },
    } );
  } );

  it( "moves a user subject into the user filter", ( ) => {
    const draft = draftFromV2State( makeV2State( { subject: { type: "user", user: USER } } ) );

    expect( draft.subject ).toBeNull( );
    expect( draft.filters.user ).toEqual( USER );
  } );

  it( "moves a project subject into the project filter", ( ) => {
    const draft = draftFromV2State(
      makeV2State( { subject: { type: "project", project: PROJECT } } ),
    );

    expect( draft.subject ).toBeNull( );
    expect( draft.filters.project ).toEqual( PROJECT );
  } );

  it( "drops an unobserved subject, which advanced search cannot express", ( ) => {
    const draft = draftFromV2State(
      makeV2State( { subject: { type: "unobserved", user: USER } } ),
    );

    expect( draft.subject ).toBeNull( );
    expect( draft.filters ).toEqual( defaultExploreV2Filters );
  } );

  it( "keeps an unknown subject", ( ) => {
    const draft = draftFromV2State( makeV2State( { subject: { type: "unknown" } } ) );

    expect( draft.subject ).toEqual( { type: "unknown" } );
  } );
} );

describe( "advancedSearchReducer", ( ) => {
  it( "does not mutate the draft it was given", ( ) => {
    const draft = makeDraft( );

    advancedSearchReducer( draft, { type: "TOGGLE_CASUAL" } );

    expect( draft ).toEqual( makeDraft( ) );
  } );

  describe( "taxon subject", ( ) => {
    it( "sets a taxon subject", ( ) => {
      const newDraft = advancedSearchReducer( makeDraft( ), {
        type: "SET_TAXON",
        taxon: TAXON,
      } );

      expect( newDraft.subject ).toEqual( { type: "taxon", taxon: TAXON } );
    } );

    it( "clears the subject when the taxon is removed", ( ) => {
      const draft = makeDraft( { subject: { type: "taxon", taxon: TAXON } } );

      const newDraft = advancedSearchReducer( draft, { type: "SET_TAXON", taxon: null } );

      expect( newDraft.subject ).toBeNull( );
    } );

    it( "sets the unknown subject, which is not a taxon", ( ) => {
      const newDraft = advancedSearchReducer( makeDraft( ), {
        type: "FILTER_BY_ICONIC_UNKNOWN",
      } );

      expect( newDraft.subject ).toEqual( { type: "unknown" } );
      expect( newDraft.filters ).toEqual( defaultExploreV2Filters );
    } );
  } );

  describe( "location", ( ) => {
    it( "sets a place", ( ) => {
      const newDraft = advancedSearchReducer( makeDraft( ), {
        type: "SET_LOCATION_PLACE",
        place: PLACE,
      } );

      expect( newDraft.location ).toEqual( {
        placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
        place: PLACE,
      } );
    } );

    it( "sets nearby", ( ) => {
      const draft = makeDraft( {
        location: { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place: PLACE },
      } );

      const newDraft = advancedSearchReducer( draft, { type: "SET_LOCATION_NEARBY" } );

      expect( newDraft.location ).toEqual( { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY } );
    } );

    it( "sets worldwide", ( ) => {
      const draft = makeDraft( {
        location: { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place: PLACE },
      } );

      const newDraft = advancedSearchReducer( draft, { type: "SET_LOCATION_WORLDWIDE" } );

      expect( newDraft.location ).toEqual( { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE } );
    } );
  } );

  it( "sets the sort order", ( ) => {
    const newDraft = advancedSearchReducer( makeDraft( ), {
      type: "SET_SORT",
      sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
    } );

    expect( newDraft.sortBy ).toEqual( OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST );
  } );

  describe( "user filter", ( ) => {
    it( "sets a user and clears any excluded user", ( ) => {
      const draft = makeDraft( { filters: { excludeUser: OTHER_USER } } );

      const newDraft = advancedSearchReducer( draft, { type: "SET_USER", user: USER } );

      expect( newDraft.filters.user ).toEqual( USER );
      expect( newDraft.filters.excludeUser ).toBeNull( );
    } );

    it( "sets an excluded user and clears any user", ( ) => {
      const draft = makeDraft( { filters: { user: USER } } );

      const newDraft = advancedSearchReducer( draft, {
        type: "SET_EXCLUDE_USER",
        user: OTHER_USER,
      } );

      expect( newDraft.filters.excludeUser ).toEqual( OTHER_USER );
      expect( newDraft.filters.user ).toBeNull( );
    } );

    it( "keeps a carried taxon subject", ( ) => {
      const draft = makeDraft( { subject: { type: "taxon", taxon: TAXON } } );

      const newDraft = advancedSearchReducer( draft, { type: "SET_USER", user: USER } );

      expect( newDraft.subject ).toEqual( { type: "taxon", taxon: TAXON } );
    } );
  } );

  describe( "project filter", ( ) => {
    it( "sets and removes a project", ( ) => {
      const withProject = advancedSearchReducer( makeDraft( ), {
        type: "SET_PROJECT",
        project: PROJECT,
      } );
      expect( withProject.filters.project ).toEqual( PROJECT );

      const withoutProject = advancedSearchReducer( withProject, {
        type: "SET_PROJECT",
        project: null,
      } );
      expect( withoutProject.filters.project ).toBeNull( );
    } );

    it( "keeps a carried taxon subject", ( ) => {
      const draft = makeDraft( { subject: { type: "taxon", taxon: TAXON } } );

      const newDraft = advancedSearchReducer( draft, {
        type: "SET_PROJECT",
        project: PROJECT,
      } );

      expect( newDraft.subject ).toEqual( { type: "taxon", taxon: TAXON } );
    } );
  } );

  describe( "quality grade", ( ) => {
    it.each( [
      ["TOGGLE_RESEARCH_GRADE", "researchGrade", false],
      ["TOGGLE_NEEDS_ID", "needsID", false],
      ["TOGGLE_CASUAL", "casual", true],
    ] )( "%s flips its grade", ( type, filterKey, expected ) => {
      const newDraft = advancedSearchReducer( makeDraft( ), { type } );

      expect( newDraft.filters[filterKey] ).toBe( expected );
    } );
  } );

  describe( "taxonomic ranks", ( ) => {
    it( "sets the highest and lowest ranks", ( ) => {
      const withHrank = advancedSearchReducer( makeDraft( ), {
        type: "SET_HRANK",
        hrank: TAXONOMIC_RANK.family,
      } );
      const withBoth = advancedSearchReducer( withHrank, {
        type: "SET_LRANK",
        lrank: TAXONOMIC_RANK.species,
      } );

      expect( withBoth.filters.hrank ).toEqual( TAXONOMIC_RANK.family );
      expect( withBoth.filters.lrank ).toEqual( TAXONOMIC_RANK.species );
    } );

    it( "treats the none rank as no rank filter", ( ) => {
      const draft = makeDraft( {
        filters: { hrank: TAXONOMIC_RANK.family, lrank: TAXONOMIC_RANK.species },
      } );

      const noHrank = advancedSearchReducer( draft, {
        type: "SET_HRANK",
        hrank: TAXONOMIC_RANK.none,
      } );
      const noRanks = advancedSearchReducer( noHrank, {
        type: "SET_LRANK",
        lrank: TAXONOMIC_RANK.none,
      } );

      expect( noRanks.filters.hrank ).toBeNull( );
      expect( noRanks.filters.lrank ).toBeNull( );
    } );
  } );

  describe( "date observed", ( ) => {
    const populated = makeDraft( {
      filters: {
        dateObserved: DATE_OBSERVED.DATE_RANGE,
        observed_on: "2024-01-01",
        d1: "2024-02-01",
        d2: "2024-03-01",
        months: [1, 2],
      },
    } );

    it( "clears every date field for all dates", ( ) => {
      const newDraft = advancedSearchReducer( populated, { type: "SET_DATE_OBSERVED_ALL" } );

      expect( newDraft.filters ).toMatchObject( {
        dateObserved: DATE_OBSERVED.ALL,
        observed_on: null,
        d1: null,
        d2: null,
        months: null,
      } );
    } );

    it( "keeps only the exact date", ( ) => {
      const newDraft = advancedSearchReducer( populated, {
        type: "SET_DATE_OBSERVED_EXACT",
        observedOn: "2024-06-01",
      } );

      expect( newDraft.filters ).toMatchObject( {
        dateObserved: DATE_OBSERVED.EXACT_DATE,
        observed_on: "2024-06-01",
        d1: null,
        d2: null,
        months: null,
      } );
    } );

    it( "keeps only the date range", ( ) => {
      const draft = makeDraft( {
        filters: {
          dateObserved: DATE_OBSERVED.EXACT_DATE,
          observed_on: "2024-01-01",
          months: [1, 2],
        },
      } );

      const newDraft = advancedSearchReducer( draft, {
        type: "SET_DATE_OBSERVED_RANGE",
        d1: "2024-02-01",
        d2: "2024-03-01",
      } );

      expect( newDraft.filters ).toMatchObject( {
        dateObserved: DATE_OBSERVED.DATE_RANGE,
        observed_on: null,
        d1: "2024-02-01",
        d2: "2024-03-01",
        months: null,
      } );
    } );

    it( "keeps only the months", ( ) => {
      const newDraft = advancedSearchReducer( populated, {
        type: "SET_DATE_OBSERVED_MONTHS",
        months: [4, 5, 6],
      } );

      expect( newDraft.filters ).toMatchObject( {
        dateObserved: DATE_OBSERVED.MONTHS,
        observed_on: null,
        d1: null,
        d2: null,
        months: [4, 5, 6],
      } );
    } );
  } );

  describe( "date uploaded", ( ) => {
    const populated = makeDraft( {
      filters: {
        dateUploaded: DATE_UPLOADED.DATE_RANGE,
        created_on: "2024-01-01",
        created_d1: "2024-02-01",
        created_d2: "2024-03-01",
      },
    } );

    it( "clears every date field for all dates", ( ) => {
      const newDraft = advancedSearchReducer( populated, { type: "SET_DATE_UPLOADED_ALL" } );

      expect( newDraft.filters ).toMatchObject( {
        dateUploaded: DATE_UPLOADED.ALL,
        created_on: null,
        created_d1: null,
        created_d2: null,
      } );
    } );

    it( "keeps only the exact date", ( ) => {
      const newDraft = advancedSearchReducer( populated, {
        type: "SET_DATE_UPLOADED_EXACT",
        createdOn: "2024-06-01",
      } );

      expect( newDraft.filters ).toMatchObject( {
        dateUploaded: DATE_UPLOADED.EXACT_DATE,
        created_on: "2024-06-01",
        created_d1: null,
        created_d2: null,
      } );
    } );

    it( "keeps only the date range", ( ) => {
      const draft = makeDraft( {
        filters: { dateUploaded: DATE_UPLOADED.EXACT_DATE, created_on: "2024-01-01" },
      } );

      const newDraft = advancedSearchReducer( draft, {
        type: "SET_DATE_UPLOADED_RANGE",
        createdD1: "2024-02-01",
        createdD2: "2024-03-01",
      } );

      expect( newDraft.filters ).toMatchObject( {
        dateUploaded: DATE_UPLOADED.DATE_RANGE,
        created_on: null,
        created_d1: "2024-02-01",
        created_d2: "2024-03-01",
      } );
    } );
  } );

  describe( "single-select filters", ( ) => {
    it.each( [
      ["media", { type: "SET_MEDIA", media: MEDIA.SOUNDS }, "media", MEDIA.SOUNDS],
      [
        "establishment means",
        { type: "SET_ESTABLISHMENT_MEAN", establishmentMean: ESTABLISHMENT_MEAN.INTRODUCED },
        "establishmentMean",
        ESTABLISHMENT_MEAN.INTRODUCED,
      ],
      [
        "the reviewed filter",
        { type: "SET_REVIEWED", reviewedFilter: REVIEWED.UNREVIEWED },
        "reviewedFilter",
        REVIEWED.UNREVIEWED,
      ],
      [
        "the photo license",
        { type: "SET_PHOTO_LICENSE", photoLicense: PHOTO_LICENSE.CC0 },
        "photoLicense",
        PHOTO_LICENSE.CC0,
      ],
    ] )( "sets %s", ( _name, action, filterKey, expected ) => {
      const newDraft = advancedSearchReducer( makeDraft( ), action );

      expect( newDraft.filters[filterKey] ).toEqual( expected );
    } );
  } );

  describe( "wild status", ( ) => {
    it( "includes casual observations when filtering for captive", ( ) => {
      const newDraft = advancedSearchReducer( makeDraft( ), {
        type: "SET_WILD_STATUS",
        wildStatus: WILD_STATUS.CAPTIVE,
      } );

      expect( newDraft.filters.wildStatus ).toEqual( WILD_STATUS.CAPTIVE );
      expect( newDraft.filters.casual ).toBe( true );
    } );

    it( "leaves casual alone for the other wild statuses", ( ) => {
      const wild = advancedSearchReducer( makeDraft( ), {
        type: "SET_WILD_STATUS",
        wildStatus: WILD_STATUS.WILD,
      } );
      expect( wild.filters.casual ).toBe( false );

      const draftWithCasual = makeDraft( { filters: { casual: true } } );
      const all = advancedSearchReducer( draftWithCasual, {
        type: "SET_WILD_STATUS",
        wildStatus: WILD_STATUS.ALL,
      } );
      expect( all.filters.casual ).toBe( true );
    } );
  } );

  it( "resets a fully populated draft to the defaults", ( ) => {
    const draft = makeDraft( {
      subject: { type: "taxon", taxon: TAXON },
      location: { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place: PLACE },
      sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
      filters: {
        casual: true,
        hrank: TAXONOMIC_RANK.family,
        media: MEDIA.PHOTOS,
        user: USER,
        project: PROJECT,
      },
    } );

    expect( advancedSearchReducer( draft, { type: "RESET" } ) ).toEqual( {
      subject: null,
      location: { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE },
      sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
      filters: defaultExploreV2Filters,
    } );
  } );
} );
