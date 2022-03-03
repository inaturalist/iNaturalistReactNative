// @flow

import { useEffect, useState } from "react";
import inatjs, { FileUpload } from "inaturalistjs";
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

const useCVSuggestions = ( currentObs: Object ): Object => {
  const [suggestions, setSuggestions] = useState( [] );

  useEffect( ( ) => {
    if ( !currentObs ) { return; }
    const uri = currentObs.observationPhotos && currentObs.observationPhotos[0].uri;
    const latitude = currentObs.latitude;
    const longitude = currentObs.longitude;

    let isCurrent = true;
    const fetchCVSuggestions = async ( ): Promise<Object> => {
      try {
        const apiToken = await getJWTToken( false );

        // works with API v1, not v2
        const params = {
          image: new FileUpload( {
            uri,
            name: "photo.jpeg",
            type: "image/jpeg"
          } ),
          // observed_on: new Date( time * 1000 ).toISOString(),
          latitude,
          longitude
        };

        const options = {
          api_token: apiToken
        };

        const r = await inatjs.computervision.score_image( params, options );
        setSuggestions( r.results );
        if ( !isCurrent ) { return; }
      } catch ( e ) {
        console.log( JSON.stringify( e.response ), "couldn't fetch CV suggestions" );
        if ( !isCurrent ) { return; }
      }
    };

    fetchCVSuggestions( );
    return ( ) => {
      isCurrent = false;
    };
  }, [currentObs] );

  return suggestions;
};

export default useCVSuggestions;


