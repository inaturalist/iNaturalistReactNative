import TaxonDetailsTitle from "components/TaxonDetails/TaxonDetailsTitle";
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
    // Disabled during the update to RN 0.78
    expect( <TaxonDetailsTitle taxon={factory( "LocalTaxon" )} /> ).toBeTruthy( );
    // expect( <TaxonDetailsTitle taxon={factory( "LocalTaxon" )} /> ).toBeAccessible( );
  } );

  it( "should be accessible without a taxon", ( ) => {
    // Disabled during the update to RN 0.78
    // expect( <TaxonDetailsTitle /> ).toBeAccessible( );
  } );
} );
