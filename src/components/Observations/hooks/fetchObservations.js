// @flow

import { useEffect, useMemo, useCallback, useRef, useState } from "react";
import inatjs from "inaturalistjs";
import Realm from "realm";

import realmConfig from "../../../models/index";

const useFetchObservations = ( ): Array<Object> => {
  const [observations, setObservations] = useState( [] );
  const realmRef = useRef( null );
  const subscriptionRef = useRef( null );

  const openRealm = useCallback( async ( ) => {
    try {
      const realm = await Realm.open( realmConfig );
      realmRef.current = realm;

      const localObservations = realm.objects( "Observation" );
      if ( localObservations?.length ) {
        setObservations( localObservations );
      }
      subscriptionRef.current = localObservations;
    }
    catch ( err ) {
      console.error( "Error opening realm: ", err.message );
    }
  }, [realmRef, setObservations] );

  const closeRealm = useCallback( ( ) => {
    const subscription = subscriptionRef.current;
    subscription?.removeAllListeners( );
    subscriptionRef.current = null;

    const realm = realmRef.current;
    realm?.close( );
    realmRef.current = null;
    setObservations( [] );
  }, [realmRef] );

  useEffect( ( ) => {
    openRealm( );

    // Return a cleanup callback to close the realm to prevent memory leaks
    return closeRealm;
  }, [openRealm, closeRealm] );

  const FIELDS = useMemo( ( ) => {
    const USER_FIELDS = {
      icon_url: true,
      id: true,
      login: true,
      name: true
    };

    const TAXON_FIELDS = {
      default_photo: {
        square_url: true
      },
      iconic_taxon_name: true,
      name: true,
      preferred_common_name: true,
      rank: true,
      rank_level: true
    };

    const ID_FIELDS = {
      body: true,
      category: true,
      created_at: true,
      current: true,
      disagreement: true,
      taxon: TAXON_FIELDS,
      updated_at: true,
      user: Object.assign( { }, USER_FIELDS, { id: true } ),
      uuid: true,
      vision: true
    };

    const PHOTO_FIELDS = {
      id: true,
      attribution: true,
      license_code: true,
      url: true
    };

    const COMMENT_FIELDS = {
      body: true,
      created_at: true,
      id: true,
      user: USER_FIELDS
    };

    return {
      comments_count: true,
      comments: COMMENT_FIELDS,
      created_at: true,
      description: true,
      geojson: true,
      identifications: ID_FIELDS,
      latitude: true,
      location: true,
      longitude: true,
      photos: PHOTO_FIELDS,
      place_guess: true,
      quality_grade: true,
      taxon: TAXON_FIELDS,
      time_observed_at: true,
      user: USER_FIELDS
  };
}, [] );

const createPhotoForRealm = ( photo ) => ( {
  id: photo.id,
  attribution: photo.attribution,
  licenseCode: photo.license_code,
  url: photo.url
} );

const createIdentificationForRealm = ( id ) => ( {
  uuid: id.uuid,
  body: id.body,
  category: id.category,
  commonName: id.taxon.preferred_common_name,
  createdAt: id.created_at,
  id: id.id,
  name: id.taxon.name,
  rank: id.taxon.rank,
  taxonPhoto: id.taxon.default_photo.square_url,
  userIcon: id.user.icon_url,
  userLogin: id.user.login,
  vision: id.vision
} );

const createCommentForRealm = ( id ) => ( {
  body: id.body,
  createdAt: id.created_at,
  id: id.id,
  user: id.user.login
} );

const createLinkedIdentifications = useCallback( ( obs ) => {
  const identifications = [];

  if ( obs.identifications.length > 0 ) {
    obs.identifications.forEach( ( id ) => {
      const linkedIdentification = createIdentificationForRealm( id );
      identifications.push( linkedIdentification );
    } );
  }
  return identifications;
}, [] );

const createLinkedPhotos = useCallback( ( obs ) => {
  const photos = [];

  if ( obs.photos.length > 0 ) {
    obs.photos.forEach( ( photo ) => {
      const linkedPhoto = createPhotoForRealm( photo );
      photos.push( linkedPhoto );
    } );
  }
  return photos;
}, [] );

const createLinkedComments = useCallback( ( obs ) => {
  const comments = [];

  if ( obs.comments.length > 0 ) {
    obs.comments.forEach( ( photo ) => {
      const linkedComment = createCommentForRealm( photo );
      comments.push( linkedComment );
    } );
  }
  return comments;
}, [] );

const createObservationForRealm = useCallback( ( obs ) => {
  const identifications = createLinkedIdentifications( obs );
  const photos = createLinkedPhotos( obs );
  const comments = createLinkedComments( obs );

  return {
    uuid: obs.uuid,
    commentCount: obs.comment_count || 0,
    comments,
    commonName: obs.taxon.preferred_common_name,
    createdAt: obs.created_at,
    description: obs.description,
    identificationCount: obs.identifications.length,
    identifications,
    // obs detail on web says geojson coords are preferred over lat/long
    // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/ducks/observation.js#L145
    latitude: obs.geojson.coordinates[1],
    location: obs.location,
    longitude: obs.geojson.coordinates[0],
    photos,
    placeGuess: obs.place_guess,
    qualityGrade: obs.quality_grade,
    taxonRank: obs.taxon.rank,
    timeObservedAt: obs.time_observed_at,
    userProfilePhoto: obs.user.icon_url,
    userLogin: obs.user.login,
    userPhoto: obs.photos[0].url
  };
}, [createLinkedIdentifications, createLinkedPhotos, createLinkedComments] );

const writeToDatabase = useCallback( ( results ) => {
    if ( results.length === 0 ) {
      return;
    }
    // Everything in the function passed to "realm.write" is a transaction and will
    // hence succeed or fail together. A transcation is the smallest unit of transfer
    // in Realm so we want to be mindful of how much we put into one single transaction
    // and split them up if appropriate (more commonly seen server side). Since clients
    // may occasionally be online during short time spans we want to increase the probability
    // of sync participants to successfully sync everything in the transaction, otherwise
    // no changes propagate and the transaction needs to start over when connectivity allows.
    const realm = realmRef.current;
    results.forEach( obs => {
      const newObs = createObservationForRealm( obs );
      realm?.write( ( ) => {
        // Shouldn't the primary key in realm handle this?
        const existingObs = realm.objects( "Observation" ).filtered( `uuid = '${obs.uuid}'` );
        if ( existingObs.length > 0 ) {
          return;
        }
        realm?.create( "Observation", newObs );
      } );
    } );
}, [createObservationForRealm] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchObservations = async ( ) => {
      try {
        const testUser = "albullington";
        const params = {
          user_login: testUser,
          per_page: 100,
          fields: FIELDS
        };
        const response = await inatjs.observations.search( params );
        const results = response.results;
        if ( !isCurrent ) { return; }
        writeToDatabase( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch observations:", e.message, );
      }
    };

    fetchObservations( );
    return ( ) => {
      isCurrent = false;
    };
  }, [FIELDS, writeToDatabase] );

  return observations;
};

export default useFetchObservations;
