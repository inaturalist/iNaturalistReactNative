import {
  DocumentDirectoryPath, downloadFile, unlink,
} from "@dr.pogodin/react-native-fs";
import type { ParamListBase } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { searchObservations } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { RealmContext } from "providers/contexts";
import type { RefObject } from "react";
import { useCallback, useState } from "react";
import { Dimensions } from "react-native";
import type MapView from "react-native-maps";
import type { Region } from "react-native-maps";
import Realm from "realm";
import type OfflineObservation from "realmModels/OfflineObservation";
import type OfflineRegion from "realmModels/OfflineRegion";
import { v4 as uuidv4 } from "uuid";

// Future: switch to MapTiler outdoor-v2 for full offline vector tiles with streets + trails.
// Requires a free API key: https://www.maptiler.com/cloud/
// const MAPTILER_STYLE_URL =
//   "https://api.maptiler.com/maps/outdoor-v2/style.json?key=YOUR_KEY";

const { useRealm } = RealmContext;

const PAGE_SIZE = 200; // iNat API max per_page

export interface SaveRegionParams {
  appleMapRef: RefObject<MapView>;
  appleMapSatelliteRef: RefObject<MapView>;
  currentRegion: Region;
  queryParams: object;
  queryLabel?: string;
  taxonImageUrl?: string | null;
}

// takeSnapshot is not in the react-native-maps public types
interface MapViewWithSnapshot {
  takeSnapshot: ( opts: object ) => Promise<string>;
}

const useOfflineRegions = () => {
  const realm = useRealm();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [isSaving, setIsSaving] = useState( false );
  const [saveProgress, setSaveProgress] = useState( 0 );

  const saveRegion = useCallback( async ( {
    appleMapRef,
    appleMapSatelliteRef,
    currentRegion,
    queryParams,
    queryLabel,
    taxonImageUrl,
  }: SaveRegionParams ) => {
    if ( isSaving || !appleMapRef.current ) { return; }
    setIsSaving( true );
    setSaveProgress( 0 );

    try {
      const { width: screenWidth, height: screenHeight } = Dimensions.get( "window" );
      const snapshotOpts = {
        width: screenWidth,
        height: screenHeight,
        region: currentRegion,
        format: "jpg",
        quality: 0.85,
        result: "file",
      };

      // 1. Standard Apple Maps snapshot (0 → 0.20)
      // MKMapSnapshotter runs entirely offscreen — no Metal rendering restriction.
      setSaveProgress( 0.05 );
      const snapshotUri: string = await (
        appleMapRef.current as unknown as MapViewWithSnapshot
      ).takeSnapshot( snapshotOpts );
      setSaveProgress( 0.20 );

      // 2. Satellite snapshot (0.20 → 0.35)
      let satelliteSnapshotUri: string | undefined;
      if ( appleMapSatelliteRef.current ) {
        satelliteSnapshotUri = await (
          appleMapSatelliteRef.current as unknown as MapViewWithSnapshot
        ).takeSnapshot( snapshotOpts );
      }
      setSaveProgress( 0.35 );

      // Compute bounds from region (accurate for typical city/park scale areas)
      const centerLatitude = currentRegion.latitude;
      const centerLongitude = currentRegion.longitude;
      const { latitudeDelta, longitudeDelta } = currentRegion;

      const neLat = centerLatitude + latitudeDelta / 2;
      const neLng = centerLongitude + longitudeDelta / 2;
      const swLat = centerLatitude - latitudeDelta / 2;
      const swLng = centerLongitude - longitudeDelta / 2;

      const regionId = uuidv4();

      // 3. Fetch observations in the visible area — paginate through all results (0.35 → 0.90)
      // Strip coordinate-based location filters — they conflict with the bounding box
      const {
        lat: _lat,
        lng: _lng,
        radius: _radius,
        swlat: _swlat,
        swlng: _swlng,
        nelat: _nelat,
        nelng: _nelng,
        return_bounds: _rb,
        ...cleanQueryParams
      } = queryParams as Record<string, unknown>;

      const apiToken = await getJWT( true ).catch( () => null );
      const opts = apiToken
        ? { api_token: apiToken }
        : {};

      const baseObsParams = {
        ...cleanQueryParams,
        nelat: neLat,
        nelng: neLng,
        swlat: swLat,
        swlng: swLng,
        per_page: PAGE_SIZE,
        fields: {
          uuid: true,
          location: true,
          obscured: true,
          place_guess: true,
          observed_on: true,
          taxon: {
            name: true,
            preferred_common_name: true,
            iconic_taxon_name: true,
          },
          photos: {
            url: true,
          },
        },
      };

      let obsList: Record<string, unknown>[] = [];
      let page = 1;
      let totalResults = 0;
      // eslint-disable-next-line no-constant-condition
      while ( true ) {
        // Pagination requires sequential requests — each page depends on the previous total
        // eslint-disable-next-line no-await-in-loop
        const obsResult = await searchObservations( { ...baseObsParams, page }, opts );
        const pageResults: Record<string, unknown>[] = obsResult?.results ?? [];
        obsList = obsList.concat( pageResults );
        totalResults = obsResult?.total_results ?? 0;
        const fetchProgress = totalResults > 0
          ? Math.min( obsList.length / totalResults, 1 )
          : 1;
        setSaveProgress( 0.35 + fetchProgress * 0.55 );
        if ( obsList.length >= totalResults || pageResults.length < PAGE_SIZE ) { break; }
        page += 1;
      }

      // 3. Build region name from first obs with a place_guess
      const firstWithPlace = obsList.find( o => o.place_guess );
      const name = firstWithPlace?.place_guess
        ?? `${centerLatitude.toFixed( 3 )}, ${centerLongitude.toFixed( 3 )}`;

      // 4. Download the taxon's default photo for the list thumbnail (0.90 → 0.95)
      let taxonImagePath: string | undefined;
      if ( taxonImageUrl ) {
        const destPath = `${DocumentDirectoryPath}/taxon_${regionId}.jpg`;
        try {
          await downloadFile( { fromUrl: taxonImageUrl, toFile: destPath } ).promise;
          taxonImagePath = destPath;
        } catch ( _e ) {
          // Non-fatal — list item will fall back to the map icon
        }
      }
      setSaveProgress( 0.95 );

      setSaveProgress( 0.90 );
      realm.write( () => {
        const region = realm.create<OfflineRegion>( "OfflineRegion", {
          id: regionId,
          name,
          savedAt: new Date(),
          queryLabel: queryLabel ?? undefined,
          taxonImagePath,
          snapshotPath: snapshotUri,
          satelliteSnapshotPath: satelliteSnapshotUri,
          snapshotWidth: screenWidth,
          snapshotHeight: screenHeight,
          centerLatitude,
          centerLongitude,
          latitudeDelta,
          longitudeDelta,
          observations: [],
        } );

        for ( const obs of obsList ) {
          if ( obs.location ) {
            const [latStr, lngStr] = String( obs.location ).split( "," );
            const latitude = parseFloat( latStr );
            const longitude = parseFloat( lngStr );
            if ( latitude && longitude ) {
              const offlineObs = realm.create<OfflineObservation>( "OfflineObservation", {
                uuid: obs.uuid,
                latitude,
                longitude,
                taxon_name: ( obs.taxon as Record<string, unknown> )?.name ?? null,
                taxon_common_name: (
                  obs.taxon as Record<string, unknown>
                )?.preferred_common_name ?? null,
                iconic_taxon_name: (
                  obs.taxon as Record<string, unknown>
                )?.iconic_taxon_name ?? null,
                observed_on: obs.observed_on ?? null,
                place_guess: obs.place_guess ?? null,
                photo_url: ( ( obs.photos as Record<string, unknown>[] )?.[0] )?.url ?? null,
                obscured: obs.obscured ?? false,
              }, Realm.UpdateMode.Modified );
              region.observations.push( offlineObs );
            }
          }
        }
      } );
    } finally {
      setIsSaving( false );
      setSaveProgress( 0 );
    }
  }, [isSaving, realm] );

  const deleteRegion = useCallback( ( regionId: string ) => {
    const region = realm.objectForPrimaryKey<OfflineRegion>( "OfflineRegion", regionId );
    if ( !region ) { return; }
    const { snapshotPath, satelliteSnapshotPath, taxonImagePath } = region;
    realm.write( () => {
      realm.delete( region.observations );
      realm.delete( region );
    } );
    // Delete image files from disk (fire-and-forget)
    if ( snapshotPath ) {
      unlink( snapshotPath ).catch( () => undefined );
    }
    if ( satelliteSnapshotPath ) {
      unlink( satelliteSnapshotPath ).catch( () => undefined );
    }
    if ( taxonImagePath ) {
      unlink( taxonImagePath ).catch( () => undefined );
    }
  }, [realm] );

  const navigateToRegionsList = useCallback( () => {
    navigation.navigate( "OfflineRegionsList" );
  }, [navigation] );

  return {
    isSaving,
    saveProgress,
    saveRegion,
    deleteRegion,
    navigateToRegionsList,
  };
};

export default useOfflineRegions;
