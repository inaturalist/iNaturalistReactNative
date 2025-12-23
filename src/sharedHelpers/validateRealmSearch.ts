// realm doesn't allow non-alphanumeric characters in search queries
// so we need to first clean strings like "Ring-billed Gull"
// to prevent the app from crashing when this is called offline

const validateRealmSearch = ( searchString: string ) => {
  if ( !searchString ) {
    throw new Error( "Search string cannot be empty" );
  }

  const hasNonAlphanumeric = /[^a-zA-Z0-9\s]/.test( searchString );

  if ( hasNonAlphanumeric ) {
    const cleanedString = searchString.replace( /[^a-zA-Z0-9\s]/g, "" );

    if ( !cleanedString.trim( ) ) {
      throw new Error( "Search string contains only non-alphanumeric characters" );
    }

    // console.warn(
    //   `Search string contained non-alphanumeric characters. Cleaned version: "${cleanedString}"`
    // );

    return {
      cleanedQuery: cleanedString,
    };
  }

  return {
    cleanedQuery: searchString,
  };
};

export default validateRealmSearch;
