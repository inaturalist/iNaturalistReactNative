// Controls for the outside world the Match screen depends on: network,
// location permission, GPS, the online CV API, and the on-device model.
// Each scenario sets these up, renders the screen, then drives them mid-test.
import Geolocation from "@react-native-community/geolocation";
import { act } from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import { checkMultiple, RESULTS } from "react-native-permissions";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import { getPredictionsForImage } from "vision-camera-plugin-inatvision";

// Shaped like an inaturalistjs HTTP error
const httpError = status => Object.assign( new Error( `HTTP ${status}` ), {
  status,
  response: {
    status,
    url: "https://api.inaturalist.org/v2/computervision/score_image",
    json: async ( ) => ( { status: String( status ), errors: [] } ),
  },
} );

// The real inaturalistjs wraps each taxon in its Taxon model, which adds
// camelCase copies (taxonPhotos, defaultPhoto, representativePhoto) that the
// app reads
const InatTaxon = jest.requireActual( "inaturalistjs/lib/models/taxon" );
const withInatTaxon = item => ( item?.taxon
  ? { ...item, taxon: new InatTaxon( item.taxon ) }
  : item );
// A taxa.fetch response as inaturalistjs returns it
export const taxaResponse = taxa => makeResponse( taxa.map( t => new InatTaxon( t ) ) );

const deferred = ( ) => {
  let resolve;
  let reject;
  const promise = new Promise( ( res, rej ) => {
    resolve = res;
    reject = rej;
  } );
  return { promise, resolve, reject };
};

export const TAXA = {
  cupPlant: factory( "RemoteTaxon", {
    id: 745,
    name: "Silphium perfoliatum",
    preferred_common_name: "Cup Plant",
    rank: "species",
    rank_level: 10,
    iconic_taxon_name: "Plantae",
  } ),
  compassPlant: factory( "RemoteTaxon", {
    id: 746,
    name: "Silphium laciniatum",
    preferred_common_name: "Compass Plant",
    rank: "species",
    rank_level: 10,
    iconic_taxon_name: "Plantae",
  } ),
  rosinweed: factory( "RemoteTaxon", {
    id: 747,
    name: "Silphium integrifolium",
    preferred_common_name: "Wholeleaf Rosinweed",
    rank: "species",
    rank_level: 10,
    iconic_taxon_name: "Plantae",
  } ),
  silphium: factory( "RemoteTaxon", {
    id: 744,
    name: "Silphium",
    preferred_common_name: "Rosinweeds",
    rank: "genus",
    rank_level: 20,
    iconic_taxon_name: "Plantae",
  } ),
  human: factory( "RemoteTaxon", {
    id: 43584,
    name: "Homo sapiens",
    preferred_common_name: "Human",
    rank: "species",
    rank_level: 10,
    iconic_taxon_name: "Mammalia",
  } ),
};

export const ICONIC_TAXA = [
  {
    id: 47126, name: "Plantae", preferred_common_name: "Plants", rank: "kingdom", rank_level: 70,
  },
  {
    id: 47158, name: "Insecta", preferred_common_name: "Insects", rank: "class", rank_level: 50,
  },
  {
    id: 3, name: "Aves", preferred_common_name: "Birds", rank: "class", rank_level: 50,
  },
];

export const suggestion = ( taxon, score ) => ( {
  taxon,
  combined_score: score,
  vision_score: score,
} );

// Offline predictions use taxon_id rather than a nested taxon
export const prediction = ( taxon, score ) => ( {
  taxon_id: taxon.id,
  name: taxon.name,
  rank_level: taxon.rank_level,
  combined_score: score,
  vision_score: score,
  ancestor_ids: [47126, taxon.id],
} );

// A new camera observation with a local photo and no location yet. The
// original photo path is left empty so it doesn't look like a gallery
// import or a share, which turn GPS off.
export const makeObservationPhoto = ( localFilePath, originalPhotoUri ) => factory(
  "LocalObservationPhoto",
  {
    originalPhotoUri,
    photo: factory( "LocalPhoto", { url: undefined, localFilePath } ),
  },
);

export const makeNewObservation = ( overrides = {} ) => factory( "LocalObservation", {
  _created_at: undefined,
  _synced_at: undefined,
  latitude: undefined,
  longitude: undefined,
  positional_accuracy: undefined,
  observationPhotos: [makeObservationPhoto( "photoUploads/match-requirements.jpg" )],
  ...overrides,
} );

export const makeWorld = ( ) => {
  const world = {
    gps: { success: null, error: null, watching: 0 },
    online: { pending: [] },
    offline: { pending: [] },
  };

  world.reset = ( ) => {
    global.mockNetwork.set( { isConnected: true, isInternetReachable: true } );
    checkMultiple.mockImplementation( async permissions => permissions.reduce(
      ( acc, permission ) => ( { ...acc, [permission]: RESULTS.GRANTED } ),
      {},
    ) );
    world.gps = { success: null, error: null, watching: 0 };
    Geolocation.watchPosition.mockImplementation( ( success, error ) => {
      world.gps.success = success;
      world.gps.error = error;
      world.gps.watching += 1;
      return world.gps.watching;
    } );
    world.online.pending = [];
    inatjs.computervision.score_image.mockReset( );
    inatjs.computervision.score_image.mockImplementation( ( ) => {
      const d = deferred( );
      world.online.pending.push( d );
      return d.promise;
    } );
    world.offline.pending = [];
    getPredictionsForImage.mockReset( );
    getPredictionsForImage.mockImplementation( ( ) => {
      const d = deferred( );
      world.offline.pending.push( d );
      return d.promise;
    } );
  };

  world.setObservation = observation => {
    useStore.setState( {
      observations: [observation],
      currentObservation: observation,
      currentObservationIndex: 0,
    } );
  };

  world.setNetwork = isConnected => act( ( ) => {
    global.mockNetwork.set( { isConnected, isInternetReachable: isConnected } );
  } );

  world.denyLocationPermission = ( ) => {
    checkMultiple.mockImplementation( async permissions => permissions.reduce(
      ( acc, permission ) => ( { ...acc, [permission]: RESULTS.DENIED } ),
      {},
    ) );
  };

  world.deliverGpsFix = ( {
    latitude, longitude, accuracy = 5, ageMs = 0,
  } ) => act( ( ) => {
    if ( !world.gps.success ) throw new Error( "Nothing is watching GPS" );
    world.gps.success( {
      coords: {
        latitude, longitude, accuracy, altitude: null, altitudeAccuracy: null,
      },
      timestamp: Date.now( ) - ageMs,
    } );
  } );

  world.blockLocationPermission = ( ) => {
    checkMultiple.mockImplementation( async permissions => permissions.reduce(
      ( acc, permission ) => ( { ...acc, [permission]: RESULTS.BLOCKED } ),
      {},
    ) );
  };

  world.failGps = ( ) => act( ( ) => {
    if ( !world.gps.error ) throw new Error( "Nothing is watching GPS" );
    world.gps.error( { code: 2, message: "Position unavailable" } );
  } );

  // What the location picker's Save does before it goes back
  world.pickLocation = ( { latitude, longitude } ) => act( ( ) => {
    useStore.getState( ).updateObservationKeys( {
      latitude,
      longitude,
      positional_accuracy: 10,
      place_guess: "Picked place",
    } );
  } );

  // Online CV: each score_image call waits until the scenario answers it
  world.onlineCalls = ( ) => inatjs.computervision.score_image.mock.calls.map( c => c[0] );
  world.respondOnline = async ( results, { commonAncestor, call } = {} ) => {
    const d = call === undefined
      ? world.online.pending.at( -1 )
      : world.online.pending[call];
    if ( !d ) throw new Error( "No online CV request is waiting" );
    const response = makeResponse( results );
    await act( async ( ) => {
      d.resolve( {
        ...response,
        results: response.results.map( withInatTaxon ),
        ...( commonAncestor && { common_ancestor: withInatTaxon( commonAncestor ) } ),
      } );
    } );
  };
  world.failOnline = async ( error = httpError( 500 ) ) => {
    const d = world.online.pending.at( -1 );
    if ( !d ) throw new Error( "No online CV request is waiting" );
    await act( async ( ) => { d.reject( error ); } );
  };
  // Every request, including retries, fails as soon as it's made
  world.onlineAlwaysFails = ( status = 500 ) => {
    inatjs.computervision.score_image.mockImplementation(
      ( ) => Promise.reject( httpError( status ) ),
    );
  };

  // On-device model
  world.offlineCalls = ( ) => getPredictionsForImage.mock.calls.map( c => c[0] );
  // The model gives the same answer for the same photo, so answer every run
  // that is still waiting
  const settleOffline = async settle => {
    const waiting = world.offline.pending.filter( d => !d.settled );
    if ( waiting.length === 0 ) throw new Error( "No on-device prediction is waiting" );
    await act( async ( ) => {
      waiting.forEach( d => {
        d.settled = true;
        settle( d );
      } );
    } );
  };
  world.respondOffline = ( predictions, { commonAncestor } = {} ) => settleOffline(
    d => d.resolve( { predictions, commonAncestor } ),
  );
  world.failOffline = ( error = new Error( "model failed" ) ) => settleOffline(
    d => d.reject( error ),
  );

  // Step through time so work scheduled partway (retries after an async
  // token fetch, say) still runs at the right moment
  world.advance = async ( ms, step = 250 ) => {
    for ( let elapsed = 0; elapsed < ms; elapsed += step ) {
      await act( async ( ) => {
        await jest.advanceTimersByTimeAsync( Math.min( step, ms - elapsed ) );
      } );
    }
  };

  return world;
};
