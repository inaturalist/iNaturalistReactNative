import TaxonDetailsTitle from "components/TaxonDetails/TaxonDetailsTitle";
import initI18next from "i18n/initI18next";
import React from "react";
import factory from "tests/factory";

describe( "TaxonDetailsTitle", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should be accessible with a taxon", ( ) => {
    expect( <TaxonDetailsTitle taxon={factory( "LocalTaxon" )} /> ).toBeAccessible( );
  } );

  it( "should be accessible without a taxon", ( ) => {
    expect( <TaxonDetailsTitle /> ).toBeAccessible( );
  } );
} );
