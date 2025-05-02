/* eslint-disable import/prefer-default-export */
// Translates rank in a way that can be statically checked
export function translatedRank( rank: string, t: ( key: string ) => string ) {
  switch ( rank ) {
    case "Class":
      return t( "Ranks-Class" );
    case "Complex":
      return t( "Ranks-Complex" );
    case "Epifamily":
      return t( "Ranks-Epifamily" );
    case "Family":
      return t( "Ranks-Family" );
    case "Form":
      return t( "Ranks-Form" );
    case "Genus":
      return t( "Ranks-Genus" );
    case "Genushybrid":
      return t( "Ranks-Genushybrid" );
    case "Hybrid":
      return t( "Ranks-Hybrid" );
    case "Infraclass":
      return t( "Ranks-Infraclass" );
    case "Infrahybrid":
      return t( "Ranks-Infrahybrid" );
    case "Infraorder":
      return t( "Ranks-Infraorder" );
    case "Kingdom":
      return t( "Ranks-Kingdom" );
    case "Order":
      return t( "Ranks-Order" );
    case "Parvorder":
      return t( "Ranks-Parvorder" );
    case "Phylum":
      return t( "Ranks-Phylum" );
    case "Section":
      return t( "Ranks-Section" );
    case "Species":
      return t( "Ranks-Species" );
    case "Statefmatter":
      return t( "Ranks-Statefmatter" );
    case "Subclass":
      return t( "Ranks-Subclass" );
    case "Subfamily":
      return t( "Ranks-Subfamily" );
    case "Subgenus":
      return t( "Ranks-Subgenus" );
    case "Subkingdom":
      return t( "Ranks-Subkingdom" );
    case "Suborder":
      return t( "Ranks-Suborder" );
    case "Subphylum":
      return t( "Ranks-Subphylum" );
    case "Subsection":
      return t( "Ranks-Subsection" );
    case "Subspecies":
      return t( "Ranks-Subspecies" );
    case "Subterclass":
      return t( "Ranks-Subterclass" );
    case "Subtribe":
      return t( "Ranks-Subtribe" );
    case "Superclass":
      return t( "Ranks-Superclass" );
    case "Superfamily":
      return t( "Ranks-Superfamily" );
    case "Superorder":
      return t( "Ranks-Superorder" );
    case "Supertribe":
      return t( "Ranks-Supertribe" );
    case "Tribe":
      return t( "Ranks-Tribe" );
    case "Variety":
      return t( "Ranks-Variety" );
    case "Zoosection":
      return t( "Ranks-Zoosection" );
    case "Zoosubsection":
      return t( "Ranks-Zoosubsection" );
    default:
      return t( "Unknown--rank" );
  }
}
