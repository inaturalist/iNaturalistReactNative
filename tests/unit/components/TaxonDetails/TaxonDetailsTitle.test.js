import TaxonDetailsTitle from "components/TaxonDetails/TaxonDetailsTitle.tsx";
import React from "react";
import factory from "tests/factory";

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: ( ) => ( {
    data: {
      total_results: 0
    }
  } )
} ) );

describe( "TaxonDetailsTitle", ( ) => {
  it( "should be accessible with a taxon", ( ) => {
    expect( <TaxonDetailsTitle taxon={factory( "LocalTaxon" )} /> ).toBeAccessible( );
  } );

  it( "should be accessible without a taxon", ( ) => {
    expect( <TaxonDetailsTitle /> ).toBeAccessible( );
  } );
} );
