import type { IconicTaxaSectionState } from "components/MyObservations/helpers/iconicTaxaSections";
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
  collapsedCategories, orderedCounts, sections, unsyncedByCategory,
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

  const place = (
    sort: OBSERVATIONS_SORT,
    loaded: Record<string, string | null>,
    uploads: { uuid: string; observedOn: string | null }[],
    hasMore = false,
  ) => placeHeldUploads( {
    sort,
    sectionUuids: Object.keys( loaded ),
    hasMore,
    uploads,
    observedOnOf: uuid => loaded[uuid] ?? null,
  } );

  const upload = ( observedOn: string | null, uuid = "new" ) => ( { uuid, observedOn } );

  describe( "by date added", ( ) => {
    it( "puts a new upload first when newest first", ( ) => {
      expect( place( DATE_UPLOADED_NEWEST, { a: null, b: null }, [upload( null )] ) )
        .toEqual( ["new", "a", "b"] );
    } );

    it( "puts a new upload last when oldest first, once the section is fully loaded", ( ) => {
      expect( place( DATE_UPLOADED_OLDEST, { a: null, b: null }, [upload( null )] ) )
        .toEqual( ["a", "b", "new"] );
    } );

    it( "leaves it out when oldest first and there are more pages, since it arrives with the "
      + "last one", ( ) => {
      expect( place( DATE_UPLOADED_OLDEST, { a: null, b: null }, [upload( null )], true ) )
        .toEqual( ["a", "b"] );
    } );
  } );

  describe( "by date observed, newest first", ( ) => {
    const loaded = { may: "2026-05-01", april: "2026-04-01", march: "2026-03-01" };

    it( "puts it before the first loaded tile observed before it", ( ) => {
      expect( place( DATE_OBSERVED_NEWEST, loaded, [upload( "2026-04-15" )] ) )
        .toEqual( ["may", "new", "april", "march"] );
    } );

    it( "puts it first among tiles observed the same day", ( ) => {
      expect( place( DATE_OBSERVED_NEWEST, loaded, [upload( "2026-04-01" )] ) )
        .toEqual( ["may", "new", "april", "march"] );
    } );

    it( "puts it last when it's older than everything and the section is fully loaded", ( ) => {
      expect( place( DATE_OBSERVED_NEWEST, loaded, [upload( "2026-01-01" )] ) )
        .toEqual( ["may", "april", "march", "new"] );
    } );

    it( "leaves it out when it's older than everything loaded and there are more pages", ( ) => {
      expect( place( DATE_OBSERVED_NEWEST, loaded, [upload( "2026-01-01" )], true ) )
        .toEqual( ["may", "april", "march"] );
    } );

    it( "places each of several uploads among the others", ( ) => {
      expect( place( DATE_OBSERVED_NEWEST, loaded, [
        upload( "2026-04-15", "mid-april" ),
        upload( "2026-04-20", "late-april" ),
      ] ) ).toEqual( ["may", "late-april", "mid-april", "april", "march"] );
    } );

    it( "puts it before loaded tiles with no date, which the server sorts last", ( ) => {
      expect( place( DATE_OBSERVED_NEWEST, { may: "2026-05-01", undated: null }, [
        upload( "2026-04-01" ),
      ] ) ).toEqual( ["may", "new", "undated"] );
    } );
  } );

  describe( "by date observed, oldest first", ( ) => {
    const loaded = { march: "2026-03-01", april: "2026-04-01", may: "2026-05-01" };

    it( "puts it before the first loaded tile observed after it", ( ) => {
      expect( place( DATE_OBSERVED_OLDEST, loaded, [upload( "2026-04-15" )] ) )
        .toEqual( ["march", "april", "new", "may"] );
    } );

    it( "puts it last among tiles observed the same day", ( ) => {
      expect( place( DATE_OBSERVED_OLDEST, loaded, [upload( "2026-04-01" )] ) )
        .toEqual( ["march", "april", "new", "may"] );
    } );
  } );

  it( "puts an upload with no date last, and leaves it out while there are more pages", ( ) => {
    const loaded = { may: "2026-05-01", april: "2026-04-01" };

    expect( place( DATE_OBSERVED_NEWEST, loaded, [upload( null )] ) )
      .toEqual( ["may", "april", "new"] );
    expect( place( DATE_OBSERVED_OLDEST, loaded, [upload( null )], true ) )
      .toEqual( ["may", "april"] );
  } );
} );

describe( "buildIconicTaxaRows with held uploads", ( ) => {
  it( "keeps unsynced observations pinned at the top while placing a held upload by "
    + "sort", ( ) => {
    const observedOn: Record<string, string> = { may: "2026-05-01", march: "2026-03-01" };
    const rows = buildIconicTaxaRows( {
      collapsedCategories: new Set( ),
      orderedCounts: [{ category: ICONIC_TAXA_GROUP.AVES, count: 3 }],
      sections: new Map( [[ICONIC_TAXA_GROUP.AVES, section( { uuids: ["may", "march"] } )]] ),
      unsyncedByCategory: new Map( [[ICONIC_TAXA_GROUP.AVES, ["unsynced"]]] ),
      uploadsByCategory: new Map( [[
        ICONIC_TAXA_GROUP.AVES,
        [{ uuid: "uploaded", observedOn: "2026-04-01" }],
      ]] ),
      sort: OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST,
      observedOnOf: uuid => observedOn[uuid] ?? null,
    } );

    expect( tileKeys( rows ) ).toEqual( ["unsynced", "may", "uploaded", "march"] );
  } );
} );
