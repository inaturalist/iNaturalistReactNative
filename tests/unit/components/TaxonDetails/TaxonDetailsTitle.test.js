import TaxonDetailsTitle from "components/TaxonDetails/TaxonDetailsTitle";
import React from "react";
import factory from "tests/factory";

describe( "TaxonDetailsTitle", ( ) => {
  it( "should be accessible with a taxon", ( ) => {
    expect( <TaxonDetailsTitle taxon={factory( "LocalTaxon" )} /> ).toBeAccessible( );
  } );

  it( "should be accessible without a taxon", ( ) => {
    expect( <TaxonDetailsTitle /> ).toBeAccessible( );
  } );
} );
