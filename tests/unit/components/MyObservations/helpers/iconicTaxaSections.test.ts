import type { IconicTaxaSectionState } from "components/MyObservations/helpers/iconicTaxaSections";
import {
  buildIconicTaxaRows,
  selectCategoryToDeepen,
} from "components/MyObservations/helpers/iconicTaxaSections";
import { ICONIC_TAXA_GROUP, ICONIC_TAXA_GROUP_ORDER } from "sharedHelpers/iconicTaxaGroupOrder";

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

describe( "selectCategoryToDeepen", ( ) => {
  const order = [ICONIC_TAXA_GROUP.PLANTAE, ICONIC_TAXA_GROUP.AVES, ICONIC_TAXA_GROUP.INSECTA];
  const noneCollapsed = new Set<ICONIC_TAXA_GROUP>( );

  it( "fetches more for the last section that still has pages", ( ) => {
    const sections = new Map( [
      [ICONIC_TAXA_GROUP.PLANTAE, section( { hasMore: true } )],
      [ICONIC_TAXA_GROUP.AVES, section( { hasMore: true } )],
    ] );

    expect( selectCategoryToDeepen( order, sections, noneCollapsed ) )
      .toBe( ICONIC_TAXA_GROUP.AVES );
  } );

  it( "returns null when the deepest section is exhausted, so the caller activates the "
    + "next category instead", ( ) => {
    const sections = new Map( [
      [ICONIC_TAXA_GROUP.PLANTAE, section( { hasMore: false } )],
    ] );

    expect( selectCategoryToDeepen( order, sections, noneCollapsed ) ).toBeNull( );
  } );

  it( "returns null while any section is fetching, so repeated onEndReached events during "
    + "one overscroll don't stack up requests", ( ) => {
    const sections = new Map( [
      [ICONIC_TAXA_GROUP.PLANTAE, section( { hasMore: true } )],
      [ICONIC_TAXA_GROUP.AVES, section( { isFetching: true, hasMore: true } )],
    ] );

    expect( selectCategoryToDeepen( order, sections, noneCollapsed ) ).toBeNull( );
  } );

  it( "skips collapsed, errored, and never-activated sections", ( ) => {
    const sections = new Map( [
      [ICONIC_TAXA_GROUP.PLANTAE, section( { hasMore: true } )],
      [ICONIC_TAXA_GROUP.AVES, section( { hasMore: true, isError: true } )],
      [ICONIC_TAXA_GROUP.INSECTA, section( { hasMore: true, isActivated: false } )],
    ] );
    const collapsed = new Set( [ICONIC_TAXA_GROUP.PLANTAE] );

    expect( selectCategoryToDeepen( order, sections, collapsed ) ).toBeNull( );
    expect( selectCategoryToDeepen( order, sections, noneCollapsed ) )
      .toBe( ICONIC_TAXA_GROUP.PLANTAE );
  } );
} );
