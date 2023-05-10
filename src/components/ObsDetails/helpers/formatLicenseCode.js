import _ from "lodash";
// format license code in Attribution.js
// cc0, cc-by-nc to CC 0, CC BY-NC
const formatLicenseCode = licenseCode => {
  let formatted = _.upperCase( licenseCode );
  if ( licenseCode === "cc-by-nc" ) {
    formatted = formatted.replaceAll( " ", "-" );
    formatted = formatted.replace( "-", " " );
  }
  return formatted;
};

export default formatLicenseCode;
