// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";
import { getJWTToken } from "../../LoginSignUp/AuthenticationService";

const TAXON_FIELDS = {
  name: true,
  preferred_common_name: true
};

const PHOTO_FIELDS = {
  medium_url: true
};

const FIELDS = {
  taxon: Object.assign( {}, TAXON_FIELDS, {
    taxon_photos: {
      photo: PHOTO_FIELDS
    }
  } )
};

const useTaxaSuggestions = ( currentObs: Object ): Object => {
  const [suggestions, setSuggestions] = useState( [] );

  useEffect( ( ) => {
    const uri = currentObs.observationPhotos && currentObs.observationPhotos[0].uri;
    const latitude = currentObs.latitude;
    const longitude = currentObs.longitude;

    let isCurrent = true;
    const fetchTaxaSuggestions = async ( ): Promise<Object> => {
      try {
        const apiToken = await getJWTToken( false );
        const params = {
          limit: 10,
          // image_url: uri
          // source: "visual",
          lat: latitude,
          lng: longitude,
          fields: FIELDS
        };
        console.log( "fetch suggestions with params: ", params );
        const options = {
          api_token: apiToken
        };

        const response = await inatjs.taxa.suggest( params, options );
        setSuggestions( response.results );
        if ( !isCurrent ) { return; }
      } catch ( e ) {
        console.log( JSON.stringify( e.response ), "couldn't fetch taxa suggestions" );
        if ( !isCurrent ) { return; }
      }
    };

    fetchTaxaSuggestions( );
    return ( ) => {
      isCurrent = false;
    };
  }, [currentObs] );

  return suggestions;
};

export default useTaxaSuggestions;


