import _ from "lodash";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";

const displayTaxonName = ({ taxon, user }) => {
  let title = ""

  if ( taxon ) {
    title = taxon.name;
    if ( taxon.rank && taxon.rank_level > 10 ) {
      title = `${taxon.rank.toLowerCase( )} ${title}`;
    }

    const commonName = checkCamelAndSnakeCase( taxon, "preferredCommonName" )
    if ( commonName ) {
      const comName = _.startCase( taxon.preferred_common_name );
      title = user && user.prefers_scientific_name_first ?
        `${title} (${_.trim( comName )})` :
        `${comName} (${_.trim( title )})`;
    }
  }

  return title
};

export default displayTaxonName;
