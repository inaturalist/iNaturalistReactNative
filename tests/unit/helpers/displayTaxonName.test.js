import displayTaxonName from "sharedHelpers/displayTaxonName";

describe( "displayTaxonName", () => {
  it( "should display common and scientific name", () => {
    const user = { prefers_scientific_name_first: false };
    const taxon = {
      iconic_taxon_name: "Actinopterygii",
      name: "Scomberoides lysan",
      preferred_common_name: "Lesser Queenfish",
      rank: "species",
      rank_level: 10
    };
    const taxonName = displayTaxonName( { taxon, user } );
    expect( taxonName ).toEqual( "Lesser Queenfish (Scomberoides lysan)" );
  } );

  it( "should display common and scientific name when scientific name is first", () => {
    const user = { prefers_scientific_name_first: true };
    const taxon = {
      iconic_taxon_name: "Actinopterygii",
      name: "Scomberoides lysan",
      preferred_common_name: "Lesser Queenfish",
      rank: "species",
      rank_level: 10
    };
    const taxonName = displayTaxonName( { taxon, user } );
    expect( taxonName ).toEqual( "Scomberoides lysan (Lesser Queenfish)" );
  } );

  it( "should display taxon correctly if no common name exists", () => {
    const user = { prefers_scientific_name_first: true };
    const taxon = {
      iconic_taxon_name: "Arachnida",
      name: "Hogna hawaiiensis",
      rank: "species",
      rank_level: 10
    };
    const taxonName = displayTaxonName( { taxon, user } );
    expect( taxonName ).toEqual( "Hogna hawaiiensis" );
  } );

  it( "should display taxon correctly if no common name or species exists", () => {
    const user = { prefers_scientific_name_first: true };
    const taxon = {
      iconic_taxon_name: "Insecta",
      name: "Orsillinae",
      rank: "subfamily",
      rank_level: 27
    };
    const taxonName = displayTaxonName( { taxon, user } );
    expect( taxonName ).toEqual( "subfamily Orsillinae" );
  } );
} );
