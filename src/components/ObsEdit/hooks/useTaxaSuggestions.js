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

const useTaxaSuggestions = ( currentObs: Object ): Object => {
  const [suggestions, setSuggestions] = useState( [] );

  useEffect( ( ) => {
    const uri = currentObs.observationPhotos && currentObs.observationPhotos[0].uri;
    const latitude = currentObs.latitude;
    const longitude = currentObs.longitude;

    // const uploadParams = await flattenUploadParameters( image );
    //   const token = createJwtToken( );
    //   const options = { api_token: token, user_agent: createUserAgent() };

    //   try {
    //     const r = await inatjs.computervision.score_image( uploadParams, options );
    //     if ( r.results.length === 0 ) {
    //       updateObs( { } );
    //       return;

    let isCurrent = true;
    const fetchTaxaSuggestions = async ( ): Promise<Object> => {
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
        // const params = {
        //   limit: 10,
        //   image_url: new FileUpload( {
        //     uri: uri,
        //     name: "photo.jpeg",
        //     type: "image/jpeg"
        //   } ),
        //   source: "visual",
        //   // lat: latitude,
        //   // lng: longitude,
        //   fields: FIELDS
        // };
        console.log( "fetch suggestions with params: ", params );
        const options = {
          api_token: apiToken
        };

        const r = await inatjs.computervision.score_image( params, options );

        // const response = await inatjs.taxa.suggest( params, options );
        console.log( r.results, "results computer vision" );
        setSuggestions( r.results );
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


