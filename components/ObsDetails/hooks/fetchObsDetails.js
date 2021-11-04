// // @flow

// import { useEffect, useMemo, useCallback, useRef, useState } from "react";
// import inatjs from "inaturalistjs";
// import Realm from "realm";

// import realmConfig from "../../../models/index";

// const useFetchObsDetails = ( uuid: string ): Object => {
//   const [comments, setComments] = useState( [] );
//   const [fetched, setFetched] = useState( false );
//   const [ids, setIds] = useState( [] );
//   const [photos, setPhotos] = useState( [] );
//   const realmRef = useRef( null );

//   const openRealm = useCallback( async ( ) => {
//     try {
//       const realm = await Realm.open( realmConfig );
//       realmRef.current = realm;
//     }
//     catch ( err ) {
//       console.error( "Error opening realm: ", err.message );
//     }
//   }, [realmRef] );

//   const closeRealm = useCallback( ( ) => {
//     const realm = realmRef.current;
//     realm?.close( );
//     realmRef.current = null;
//     // setComments( [] );
//   }, [realmRef] );

//   useEffect( ( ) => {
//     openRealm( );

//     // Return a cleanup callback to close the realm to prevent memory leaks
//     return closeRealm;
//   }, [openRealm, closeRealm] );

//   const FIELDS = useMemo( ( ) => {
//     // similar fields as web:
//     // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/ducks/observation.js
//     const TAXON_FIELDS = {
//       ancestry: true,
//       ancestor_ids: true,
//       ancestors: {
//         id: true,
//         uuid: true,
//         name: true,
//         iconic_taxon_name: true,
//         is_active: true,
//         preferred_common_name: true,
//         rank: true,
//         rank_level: true
//       },
//       default_photo: {
//         attribution: true,
//         license_code: true,
//         url: true,
//         square_url: true
//       },
//       iconic_taxon_name: true,
//       id: true,
//       is_active: true,
//       name: true,
//       preferred_common_name: true,
//       rank: true,
//       rank_level: true
//     };

//     const PHOTO_FIELDS = {
//       id: true,
//       uuid: true,
//       url: true,
//       license_code: true
//     };

//     const USER_FIELDS = {
//       login: true,
//       icon_url: true
//     };

//     const MODERATOR_ACTION_FIELDS = {
//       action: true,
//       id: true,
//       created_at: true,
//       reason: true,
//       user: USER_FIELDS
//     };

//     const ID_FIELDS = {
//       body: true,
//       category: true,
//       created_at: true,
//       current: true,
//       disagreement: true,
//       flags: { id: true },
//       hidden: true,
//       moderator_actions: MODERATOR_ACTION_FIELDS,
//       previous_observation_taxon: TAXON_FIELDS,
//       spam: true,
//       taxon: TAXON_FIELDS,
//       taxon_change: { id: true, type: true },
//       updated_at: true,
//       user: Object.assign( { }, USER_FIELDS, { id: true } ),
//       uuid: true,
//       vision: true
//     };

//     const COMMENT_FIELDS = {
//       body: true,
//       created_at: true,
//       id: true,
//       user: USER_FIELDS
//     };

//     return {
//       comments: COMMENT_FIELDS,
//       identifications: ID_FIELDS,
//       photos: PHOTO_FIELDS
//     };
//   }, [] );

//   const createIdentificationForRealm = ( id ) => ( {
//     uuid: id.uuid,
//     body: id.body,
//     category: id.category,
//     commonName: id.taxon.preferred_common_name,
//     createdAt: id.created_at,
//     id: id.id,
//     name: id.taxon.name,
//     rank: id.taxon.rank,
//     taxonPhoto: id.taxon.default_photo.square_url,
//     userIcon: id.user.icon_url,
//     userLogin: id.user.login,
//     vision: id.vision
//   } );

//   const writeToDatabase = useCallback( ( results ) => {
//     if ( results.length === 0 ) {
//       return;
//     }
//     const realm = realmRef.current;
//     results.forEach( id => {
//       const newId = createIdentificationForRealm( id );
//       realm?.write( ( ) => {
//         const linkedObservation = realm.objects( "Observation" ).filtered( `uuid = '${uuid}'` );
//         console.log( linkedObservation, "linked obs" );
//         // linkedObservation.identifications.push( newId );
//       } );
//     } );
//   }, [uuid] );

//   useEffect( ( ) => {
//     let isCurrent = true;
//     const fetchIds = async ( ) => {
//       try {
//         const params = {
//           per_page: 50,
//           fields: FIELDS
//         };
//         const response = await inatjs.observations.fetch( [uuid], params );
//         const results = response.results;
//         const obsIds = results[0].identifications;
//         const obsPhotos = results[0].photos;
//         // const obsComments = results[0].comments;
//         if ( !isCurrent || obsIds.length === 0 || fetched ) { return; }
//         setIds( obsIds );
//         writeToDatabase( obsIds );
//         setPhotos( obsPhotos );
//         // setComments( obsComments );
//         setFetched( true );
//         // writeToDatabase( results );
//       } catch ( e ) {
//         if ( !isCurrent ) { return; }
//         console.log( e, "couldn't save ids to realm" );
//       }
//     };

//     fetchIds( );
//     return ( ) => {
//       isCurrent = false;
//     };
//   }, [FIELDS, comments, uuid, fetched, writeToDatabase] );

//   return {
//     ids,
//     photos
//   };
// };

// export default useFetchObsDetails;
