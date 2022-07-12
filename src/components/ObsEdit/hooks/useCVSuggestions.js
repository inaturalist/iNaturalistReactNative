// @flow

import inatjs, { FileUpload } from "inaturalistjs";
import { useEffect, useState } from "react";

import Photo from "../../../models/Photo";
import { getJWTToken } from "../../LoginSignUp/AuthenticationService";

const TAXON_FIELDS = {
  name: true,
  preferred_common_name: true
};

const PHOTO_FIELDS = {
  medium_url: true
};

const FIELDS = {
  taxon: {
    ...TAXON_FIELDS,
    taxon_photos: {
      photo: PHOTO_FIELDS
    }
  }
};

const useCVSuggestions = (
  currentObs: Object,
  showSeenNearby: boolean,
  selectedPhoto: number
): Object => {
  const [suggestions, setSuggestions] = useState( [] );
  const [status, setStatus] = useState( null );

  useEffect( ( ) => {
    if ( !currentObs || !currentObs.observationPhotos ) { return ( ) => { }; }
    const uri = currentObs.observationPhotos && currentObs.observationPhotos[selectedPhoto].uri;
    const { latitude } = currentObs;
    const { longitude } = currentObs;

    let isCurrent = true;
    const fetchCVSuggestions = async ( ): Promise<Object> => {
      try {
        setSuggestions( [] );
        // observed_on: new Date( time * 1000 ).toISOString(),
        const apiToken = await getJWTToken( false );
        const resizedPhoto = await Photo.resizeImageForUpload( uri );

        const params = {
          image: new FileUpload( {
            uri: resizedPhoto,
            name: "photo.jpeg",
            type: "image/jpeg"
          } ),
          fields: FIELDS
        };

        if ( showSeenNearby ) {
          // $FlowFixMe
          params.latitude = latitude;
          // $FlowFixMe
          params.longitude = longitude;
        }

        const options = {
          api_token: apiToken
        };

        const r = await inatjs.computervision.score_image( params, options );
        if ( r.total_results > 0 ) {
          setSuggestions( r.results );
        } else {
          setStatus( "no_results" );
        }
        if ( !isCurrent ) { return; }
      } catch ( e ) {
        console.log( JSON.stringify( e.response ), "couldn't fetch CV suggestions" );
      }
    };

    fetchCVSuggestions( );
    return ( ) => {
      isCurrent = false;
    };
  }, [currentObs, showSeenNearby, selectedPhoto] );

  return {
    suggestions,
    status
  };
};

export default useCVSuggestions;
