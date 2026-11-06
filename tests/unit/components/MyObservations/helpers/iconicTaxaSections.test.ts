import type {
  IconicTaxaSectionState,
  SortableObservation,
} from "components/MyObservations/helpers/iconicTaxaSections";
import {
  buildIconicTaxaRows,
  categoryToDeepen,
  placeHeldUploads,
  sectionRangeAtRow,
  sectionRowRanges,
} from "components/MyObservations/helpers/iconicTaxaSections";
import { ICONIC_TAXA_GROUP, ICONIC_TAXA_GROUP_ORDER } from "sharedHelpers/iconicTaxaGroupOrder";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";

const section = ( overrides: Partial<IconicTaxaSectionState> = {} ): IconicTaxaSectionState => ( {
  uuids: [],
  isActivated: true,
  isFetching: false,
  isError: false,
  hasMore: false,
  ...overrides,
} );

const countsFor = ( counts: Partial<Record<ICONIC_TAXA_GROUP, number>> ) => ICONIC_TAXA_GROUP_ORDER
  .map( category => ( { category, count: counts[category] ?? 0 } ) );

const buildRows = ( {
  collapsedCategories = new Set<ICONIC_TAXA_GROUP>( ),
  orderedCounts = countsFor( {} ),
  sections = new Map( ),
  unsyncedByCategory = new Map( ),
} = {} ) => buildIconicTaxaRows( {
  collapsedCategories,
  orderedCounts,
  sections,
  unsyncedByCategory,
  uploadsByCategory: new Map( ),
  sort: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
  getObservationByUuid: ( ) => null,
} );

const tileKeys = ( rows: ReturnType<typeof buildRows> ) => rows
  .filter( row => row.type === "tile" )
  .map( row => row.key );

describe( "buildIconicTaxaRows", ( ) => {
  it( "renders a header for every category, including ones the user has no obs for ", ( ) => {
    const rows = buildRows( { orderedCounts: countsFor( { [ICONIC_TAXA_GROUP.AVES]: 3 } ) } );

    const headers = rows.filter( row => row.type === "header" );
    expect( headers ).toHaveLength( ICONIC_TAXA_GROUP_ORDER.length );
    expect( headers.every( row => row.type === "header" && row.header.isOpen ) ).toBe( true );
  } );

  it( "renders only the header for a collapsed category", ( ) => {
    const rows = buildRows( {
      collapsedCategories: new Set( [ICONIC_TAXA_GROUP.AVES] ),
      sections: new Map( [
        [ICONIC_TAXA_GROUP.AVES, section( { uuids: ["bird-1"], isFetching: true } )],
      ] ),
      unsyncedByCategory: new Map( [[ICONIC_TAXA_GROUP.AVES, ["bird-unsynced"]]] ),
    } );

    expect( tileKeys( rows ) ).toEqual( [] );
    expect( rows.some( row => row.type === "span" ) ).toBe( false );
  } );

  it( "pins unsynced observations above the server results in their section", ( ) => {
    const rows = buildRows( {
      sections: new Map( [
        [ICONIC_TAXA_GROUP.AVES, section( { uuids: ["server-1", "server-2"] } )],
      ] ),
      unsyncedByCategory: new Map( [[ICONIC_TAXA_GROUP.AVES, ["unsynced-1"]]] ),
    } );

    expect( tileKeys( rows ) ).toEqual( ["unsynced-1", "server-1", "server-2"] );
  } );

  it( "does not render an observation twice when it is pinned under a different category "
    + "than the server returns it in", ( ) => {
    // e.g. the user re-identified a bird as a plant locally and hasn't uploaded that yet
    const rows = buildRows( {
      sections: new Map( [
        [ICONIC_TAXA_GROUP.AVES, section( { uuids: ["re-identified", "server-1"] } )],
      ] ),
      unsyncedByCategory: new Map( [[ICONIC_TAXA_GROUP.PLANTAE, ["re-identified"]]] ),
    } );

    expect( tileKeys( rows ) ).toEqual( ["re-identified", "server-1"] );
  } );

  it( "appends a loading row to the section that is fetching", ( ) => {
    const rows = buildRows( {
      sections: new Map( [
        [ICONIC_TAXA_GROUP.AVES, section( { uuids: ["server-1"], isFetching: true } )],
      ] ),
    } );

    const spans = rows.filter( row => row.type === "span" );
    expect( spans ).toHaveLength( 1 );
    expect( spans[0] ).toMatchObject( {
      itemType: "loading",
      content: { category: ICONIC_TAXA_GROUP.AVES, kind: "loading" },
    } );
    expect( rows.indexOf( spans[0] ) )
      .toBeGreaterThan( rows.findIndex( row => row.key === "server-1" ) );
  } );

  it( "appends an error row to a section whose request failed, keeping what it had", ( ) => {
    const rows = buildRows( {
      sections: new Map( [
        [ICONIC_TAXA_GROUP.AVES, section( { uuids: ["server-1"], isError: true } )],
      ] ),
    } );

    expect( tileKeys( rows ) ).toEqual( ["server-1"] );
    expect( rows.filter( row => row.type === "span" )[0] ).toMatchObject( { itemType: "error" } );
  } );
} );

describe( "sectionRowRanges", ( ) => {
  it( "reports where each section ends, which is not where the list ends", ( ) => {
    const rows = buildRows( {
      sections: new Map( [
        [ICONIC_TAXA_GROUP.PLANTAE, section( { uuids: ["a", "b"] } )],
        [ICONIC_TAXA_GROUP.AVES, section( { uuids: ["c"] } )],
      ] ),
    } );

    const ranges = sectionRowRanges( rows );
    const plantae = ranges.find( range => range.category === ICONIC_TAXA_GROUP.PLANTAE );

    // Plantae's tiles run out long before the list does, since every remaining category still
    // renders a header below it
    expect( plantae?.lastTileRow ).toBe( 2 );
    expect( rows.length - 1 ).toBeGreaterThan( plantae!.lastTileRow );
  } );

  it( "gives a collapsed or empty section a range covering only its header", ( ) => {
    const rows = buildRows( {
      collapsedCategories: new Set( [ICONIC_TAXA_GROUP.PLANTAE] ),
      sections: new Map( [[ICONIC_TAXA_GROUP.PLANTAE, section( { uuids: ["a"] } )]] ),
    } );

    const plantae = sectionRowRanges( rows )
      .find( range => range.category === ICONIC_TAXA_GROUP.PLANTAE );

    expect( plantae?.headerRow ).toBe( plantae?.lastRow );
    expect( plantae?.lastTileRow ).toBe( -1 );
  } );
} );

describe( "sectionRangeAtRow", ( ) => {
  it( "finds the section a row belongs to, header and tiles alike", ( ) => {
    const rows = buildRows( {
      sections: new Map( [
        [ICONIC_TAXA_GROUP.PLANTAE, section( { uuids: ["a", "b"] } )],
        [ICONIC_TAXA_GROUP.AVES, section( { uuids: ["c"] } )],
      ] ),
    } );
    const ranges = sectionRowRanges( rows );

    expect( sectionRangeAtRow( ranges, 0 )?.category ).toBe( ICONIC_TAXA_GROUP.PLANTAE );
    expect( sectionRangeAtRow( ranges, 2 )?.category ).toBe( ICONIC_TAXA_GROUP.PLANTAE );
    expect( sectionRangeAtRow( ranges, 4 )?.category ).toBe( ICONIC_TAXA_GROUP.AVES );
  } );
} );

describe( "categoryToDeepen", ( ) => {
  const {
    PLANTAE, AVES, INSECTA, FUNGI,
  } = ICONIC_TAXA_GROUP;
  const orderedCategories = [PLANTAE, AVES, INSECTA, FUNGI];

  // Every category gets a section, the way the hook exposes them: the ones given here have been
  // fetched, and the rest haven't
  const sectionsWith = (
    overrides: Partial<Record<ICONIC_TAXA_GROUP, Partial<IconicTaxaSectionState>>>,
  ) => new Map( orderedCategories.map( category => [
    category,
    overrides[category]
      ? section( overrides[category] )
      : section( { isActivated: false } ),
  ] ) );

  const decide = (
    landedOn: ICONIC_TAXA_GROUP,
    overrides: Partial<Record<ICONIC_TAXA_GROUP, Partial<IconicTaxaSectionState>>>,
    collapsedCategories = new Set<ICONIC_TAXA_GROUP>( ),
  ) => categoryToDeepen(
    orderedCategories,
    sectionsWith( overrides ),
    collapsedCategories,
    landedOn,
  );

  it( "deepens the section the user was reading when a fast scroll lands in the unloaded "
    + "headers below it", ( ) => {
    expect( decide( INSECTA, { [PLANTAE]: { uuids: ["a"], hasMore: true } } ) )
      .toEqual( { action: "deepen", category: PLANTAE } );
  } );

  it( "deepens the section the user landed in when it has more to load", ( ) => {
    expect( decide( PLANTAE, { [PLANTAE]: { uuids: ["a"], hasMore: true } } ) )
      .toEqual( { action: "deepen", category: PLANTAE } );
  } );

  it( "starts the next category once the section above the landing point is exhausted", ( ) => {
    expect( decide( INSECTA, { [PLANTAE]: { uuids: ["a"], hasMore: false } } ) )
      .toEqual( { action: "advance" } );
  } );

  it( "starts the next category when nothing at or above the landing point has been "
    + "fetched", ( ) => {
    expect( decide( AVES, {} ) ).toEqual( { action: "advance" } );
  } );

  it( "stops at the nearest fetched section rather than deepening a partly loaded one further "
    + "up", ( ) => {
    // Plantae was collapsed partway through and reopened, so it sits above an exhausted Aves
    expect( decide( FUNGI, {
      [PLANTAE]: { uuids: ["a"], hasMore: true },
      [AVES]: { uuids: ["b"], hasMore: false },
    } ) ).toEqual( { action: "advance" } );
  } );

  it( "walks past collapsed sections on the way up", ( ) => {
    expect( decide(
      INSECTA,
      {
        [PLANTAE]: { uuids: ["a"], hasMore: true },
        [AVES]: { uuids: ["b"], hasMore: false },
      },
      new Set( [AVES] ),
    ) ).toEqual( { action: "deepen", category: PLANTAE } );
  } );

  it( "waits on an errored section rather than skipping past it", ( ) => {
    expect( decide( INSECTA, { [PLANTAE]: { uuids: ["a"], hasMore: true, isError: true } } ) )
      .toEqual( { action: "wait" } );
  } );

  it( "walks past a section whose only tiles are unsynced local observations", ( ) => {
    // The server has nothing under Aves, so it's never fetched, even though rows for its
    // unsynced observations are on screen
    expect( decide( AVES, { [PLANTAE]: { uuids: ["a"], hasMore: true } } ) )
      .toEqual( { action: "deepen", category: PLANTAE } );
  } );
} );

describe( "placeHeldUploads", ( ) => {
  const {
    DATE_UPLOADED_NEWEST, DATE_UPLOADED_OLDEST, DATE_OBSERVED_NEWEST, DATE_OBSERVED_OLDEST,
  } = OBSERVATIONS_SORT;

  // Loaded tiles are listed in server order, and are what the section has fetched. Uploads are
  // in Realm but not in the section unless also listed in loaded.
  const place = (
    sort: OBSERVATIONS_SORT,
    loaded: Record<string, SortableObservation>,
    uploads: Record<string, SortableObservation>,
    { hasMore = false, sectionUuids = Object.keys( loaded ) } = {},
  ) => placeHeldUploads( {
    sort,
    sectionUuids,
    hasMore,
    uploadUuids: Object.keys( uploads ),
    getObservationByUuid: uuid => loaded[uuid] ?? uploads[uuid] ?? null,
  } );

  describe( "by date added", ( ) => {
    const newestFirst = { fifty: { id: 50 }, forty: { id: 40 }, twenty: { id: 20 } };

    it( "puts a new upload first when newest first", ( ) => {
      expect( place( DATE_UPLOADED_NEWEST, newestFirst, { new: { id: 60 } } ) )
        .toEqual( ["new", "fifty", "forty", "twenty"] );
    } );

    it( "puts an earlier upload from this session among the loaded tiles, not above newer "
      + "ones, once a refresh has moved it off the first page", ( ) => {
      expect( place( DATE_UPLOADED_NEWEST, newestFirst, { earlier: { id: 30 } } ) )
        .toEqual( ["fifty", "forty", "earlier", "twenty"] );
      expect( place( DATE_UPLOADED_NEWEST, newestFirst, { earlier: { id: 10 } }, {
        hasMore: true,
      } ) ).toEqual( ["fifty", "forty", "twenty"] );
    } );

    it( "puts a new upload last when oldest first, once the section is fully loaded", ( ) => {
      const oldestFirst = { twenty: { id: 20 }, forty: { id: 40 } };

      expect( place( DATE_UPLOADED_OLDEST, oldestFirst, { new: { id: 60 } } ) )
        .toEqual( ["twenty", "forty", "new"] );
      expect( place( DATE_UPLOADED_OLDEST, oldestFirst, { new: { id: 60 } }, { hasMore: true } ) )
        .toEqual( ["twenty", "forty"] );
    } );
  } );

  describe( "by date observed, newest first", ( ) => {
    const loaded = {
      may: { id: 1, time_observed_at: "2026-05-01T12:00:00+00:00" },
      aprilEvening: { id: 2, time_observed_at: "2026-04-01T18:00:00+00:00" },
      aprilMorning: { id: 3, time_observed_at: "2026-04-01T09:00:00+00:00" },
      march: { id: 4, time_observed_at: "2026-03-01T12:00:00+00:00" },
    };

    it( "places a new upload by when it was observed, down to the time of day", ( ) => {
      expect( place( DATE_OBSERVED_NEWEST, loaded, {
        new: { id: 9, observed_on_string: "2026-04-01T12:00:00" },
      } ) ).toEqual( ["may", "aprilEvening", "new", "aprilMorning", "march"] );
    } );

    it( "compares by the moment observed, not the clock time where it was observed", ( ) => {
      // 06:00 at UTC-6 is 12:00 UTC, after the 09:00 UTC tile
      expect( place( DATE_OBSERVED_NEWEST, {
        aprilMorning: { id: 3, time_observed_at: "2026-04-01T09:00:00+00:00" },
      }, {
        new: { id: 9, time_observed_at: "2026-04-01T06:00:00-06:00" },
      } ) ).toEqual( ["new", "aprilMorning"] );
    } );

    it( "breaks a tie on the moment observed by id, newest first", ( ) => {
      expect( place( DATE_OBSERVED_NEWEST, loaded, {
        older: { id: 7, observed_on_string: "2026-04-01T09:00:00" },
        newer: { id: 8, observed_on_string: "2026-04-01T09:00:00" },
      } ) ).toEqual( ["may", "aprilEvening", "newer", "older", "aprilMorning", "march"] );
    } );

    it( "puts a loaded tile with only a date at the start of its day", ( ) => {
      expect( place( DATE_OBSERVED_NEWEST, {
        aprilMorning: { id: 3, time_observed_at: "2026-04-01T09:00:00+00:00" },
        aprilNoTime: { id: 5, observed_on: "2026-04-01" },
      }, {
        new: { id: 9, observed_on_string: "2026-04-01T06:00:00" },
      } ) ).toEqual( ["aprilMorning", "new", "aprilNoTime"] );
    } );

    it( "leaves it out when it's older than everything loaded and there are more pages", ( ) => {
      const uploads = { new: { id: 9, observed_on_string: "2026-01-01T12:00:00" } };

      expect( place( DATE_OBSERVED_NEWEST, loaded, uploads ) )
        .toEqual( ["may", "aprilEvening", "aprilMorning", "march", "new"] );
      expect( place( DATE_OBSERVED_NEWEST, loaded, uploads, { hasMore: true } ) )
        .toEqual( ["may", "aprilEvening", "aprilMorning", "march"] );
    } );

    it( "puts an upload with no date last, as the server does", ( ) => {
      expect( place( DATE_OBSERVED_NEWEST, loaded, { new: { id: 9 } } ) )
        .toEqual( ["may", "aprilEvening", "aprilMorning", "march", "new"] );
    } );
  } );

  describe( "by date observed, oldest first", ( ) => {
    const loaded = {
      aprilMorning: { id: 3, time_observed_at: "2026-04-01T09:00:00+00:00" },
      aprilEvening: { id: 2, time_observed_at: "2026-04-01T18:00:00+00:00" },
    };

    it( "places it by the moment observed, and breaks ties by id, oldest first", ( ) => {
      expect( place( DATE_OBSERVED_OLDEST, loaded, {
        newer: { id: 8, observed_on_string: "2026-04-01T12:00:00" },
        older: { id: 7, observed_on_string: "2026-04-01T12:00:00" },
      } ) ).toEqual( ["aprilMorning", "older", "newer", "aprilEvening"] );
    } );

    it( "puts an upload with no date last, and leaves it out while there are more pages", ( ) => {
      expect( place( DATE_OBSERVED_OLDEST, loaded, { new: { id: 9 } } ) )
        .toEqual( ["aprilMorning", "aprilEvening", "new"] );
      expect( place( DATE_OBSERVED_OLDEST, loaded, { new: { id: 9 } }, { hasMore: true } ) )
        .toEqual( ["aprilMorning", "aprilEvening"] );
    } );
  } );

  it( "leaves an upload whose server copy has loaded where the server put it, even as the "
    + "last loaded tile of a section with more pages", ( ) => {
    const loaded = { fifty: { id: 50 }, uploaded: { id: 45 } };

    expect( place( DATE_UPLOADED_NEWEST, loaded, { uploaded: { id: 45 } }, { hasMore: true } ) )
      .toEqual( ["fifty", "uploaded"] );
  } );
} );

describe( "buildIconicTaxaRows with held uploads", ( ) => {
  const observations: Record<string, SortableObservation> = {
    may: { id: 1, time_observed_at: "2026-05-01T12:00:00+00:00" },
    march: { id: 2, time_observed_at: "2026-03-01T12:00:00+00:00" },
    uploaded: { id: 3, observed_on_string: "2026-04-01T12:00:00" },
  };

  const rowsWith = ( {
    sections,
    unsyncedByCategory = new Map( ),
    uploadsByCategory,
  }: {
    sections: Map<ICONIC_TAXA_GROUP, IconicTaxaSectionState>;
    unsyncedByCategory?: Map<ICONIC_TAXA_GROUP, string[]>;
    uploadsByCategory: Map<ICONIC_TAXA_GROUP, string[]>;
  } ) => buildIconicTaxaRows( {
    collapsedCategories: new Set( ),
    orderedCounts: [
      { category: ICONIC_TAXA_GROUP.AVES, count: 3 },
      { category: ICONIC_TAXA_GROUP.PLANTAE, count: 1 },
    ],
    sections,
    unsyncedByCategory,
    uploadsByCategory,
    sort: OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST,
    getObservationByUuid: uuid => observations[uuid] ?? null,
  } );

  it( "keeps unsynced observations pinned at the top while placing a held upload by "
    + "sort", ( ) => {
    const rows = rowsWith( {
      sections: new Map( [[ICONIC_TAXA_GROUP.AVES, section( { uuids: ["may", "march"] } )]] ),
      unsyncedByCategory: new Map( [[ICONIC_TAXA_GROUP.AVES, ["unsynced"]]] ),
      uploadsByCategory: new Map( [[ICONIC_TAXA_GROUP.AVES, ["uploaded"]]] ),
    } );

    expect( tileKeys( rows ) ).toEqual( ["unsynced", "may", "uploaded", "march"] );
  } );

  it( "shows a held upload only under its local category when the server still lists it "
    + "under another", ( ) => {
    const rows = rowsWith( {
      sections: new Map( [
        [ICONIC_TAXA_GROUP.AVES, section( { uuids: ["may", "march"] } )],
        [ICONIC_TAXA_GROUP.PLANTAE, section( { uuids: ["uploaded"] } )],
      ] ),
      uploadsByCategory: new Map( [[ICONIC_TAXA_GROUP.AVES, ["uploaded"]]] ),
    } );

    expect( tileKeys( rows ) ).toEqual( ["may", "uploaded", "march"] );
  } );
} );
