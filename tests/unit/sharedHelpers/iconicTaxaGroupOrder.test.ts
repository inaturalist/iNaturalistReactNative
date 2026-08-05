import {
  ICONIC_TAXA_GROUP,
  ICONIC_TAXA_GROUP_ORDER,
  orderIconicTaxaCounts,
} from "sharedHelpers/iconicTaxaGroupOrder";

const resultFor = ( name: string, count: number ) => ( {
  count,
  taxon: { name },
} );

const otherResult = ( count: number ) => ( {
  count,
  taxon: null,
} );

describe( "orderIconicTaxaCounts", () => {
  it( "orders categories strictly by count, descending", () => {
    const results = [
      resultFor( "Aves", 10 ),
      resultFor( "Plantae", 50 ),
      resultFor( "Insecta", 30 ),
      otherResult( 5 ),
    ];

    const ordered = orderIconicTaxaCounts( results );

    expect( ordered.map( o => o.category ) ).toEqual( [
      ICONIC_TAXA_GROUP.PLANTAE,
      ICONIC_TAXA_GROUP.INSECTA,
      ICONIC_TAXA_GROUP.AVES,
      ICONIC_TAXA_GROUP.OTHER,
      ICONIC_TAXA_GROUP.ARACHNIDA,
      ICONIC_TAXA_GROUP.FUNGI,
      ICONIC_TAXA_GROUP.MOLLUSCA,
      ICONIC_TAXA_GROUP.MAMMALIA,
      ICONIC_TAXA_GROUP.AMPHIBIA,
      ICONIC_TAXA_GROUP.REPTILIA,
      ICONIC_TAXA_GROUP.ACTINOPTERYGII,
      ICONIC_TAXA_GROUP.CHROMISTA,
      ICONIC_TAXA_GROUP.PROTOZOA,
      ICONIC_TAXA_GROUP.ANIMALIA,
    ] );
    expect( ordered.find( o => o.category === ICONIC_TAXA_GROUP.PLANTAE )?.count ).toBe( 50 );
  } );

  it( "falls back to the fixed tie-break order when all counts are equal (including zero)", () => {
    const ordered = orderIconicTaxaCounts( [] );

    expect( ordered.map( o => o.category ) ).toEqual( ICONIC_TAXA_GROUP_ORDER );
    expect( ordered.every( o => o.count === 0 ) ).toBe( true );
  } );

  it( "breaks ties among only the categories that are tied, leaving others in count order", () => {
    const results = [
      resultFor( "Plantae", 20 ),
      resultFor( "Mammalia", 5 ),
      resultFor( "Fungi", 5 ),
      resultFor( "Aves", 5 ),
      otherResult( 1 ),
    ];

    const ordered = orderIconicTaxaCounts( results );

    expect( ordered.map( o => o.category ) ).toEqual( [
      ICONIC_TAXA_GROUP.PLANTAE,
      ICONIC_TAXA_GROUP.AVES,
      ICONIC_TAXA_GROUP.FUNGI,
      ICONIC_TAXA_GROUP.MAMMALIA,
      ICONIC_TAXA_GROUP.OTHER,
      ICONIC_TAXA_GROUP.INSECTA,
      ICONIC_TAXA_GROUP.ARACHNIDA,
      ICONIC_TAXA_GROUP.MOLLUSCA,
      ICONIC_TAXA_GROUP.AMPHIBIA,
      ICONIC_TAXA_GROUP.REPTILIA,
      ICONIC_TAXA_GROUP.ACTINOPTERYGII,
      ICONIC_TAXA_GROUP.CHROMISTA,
      ICONIC_TAXA_GROUP.PROTOZOA,
      ICONIC_TAXA_GROUP.ANIMALIA,
    ] );
  } );

  it( "maps a null taxon to the OTHER category", () => {
    const ordered = orderIconicTaxaCounts( [otherResult( 3 )] );

    expect( ordered.find( o => o.category === ICONIC_TAXA_GROUP.OTHER )?.count ).toBe( 3 );
  } );
} );
