// @flow

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import { View } from "components/styledComponents";
import LocationIndicator from "images/svg/location_indicator.svg";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import MapView, {
  Circle,
  Marker,
  Polygon,
  UrlTile
} from "react-native-maps";
import { useTheme } from "react-native-paper";
import createUTFPosition from "sharedHelpers/createUTFPosition";
import getDataForPixel from "sharedHelpers/fetchUTFGridData";
import { useDeviceOrientation } from "sharedHooks";
import useTranslation from "sharedHooks/useTranslation";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

const calculateZoom = ( width, delta ) => Math.round(
  Math.log2( 360 * ( width / 256 / delta ) ) + 1
);

const POINT_TILES_ENDPOINT = "https://tiles.inaturalist.org/v1/points";
const API_ENDPOINT = "https://api.inaturalist.org/v2";
const OBSCURATION_CELL_SIZE = 0.2;
const NEARBY_DIM_M = 50_000;

// Adapted from
// https://github.com/inaturalist/inaturalist/blob/main/app/assets/javascripts/inaturalist/map3.js.erb#L1500
function obscurationCellForLatLng( lat, lng ) {
  const coords = [lat, lng];
  const firstCorner = [
    coords[0] - ( coords[0] % OBSCURATION_CELL_SIZE ),
    coords[1] - ( coords[1] % OBSCURATION_CELL_SIZE )
  ];
  const secondCorner = [firstCorner[0], firstCorner[1]];
  coords.forEach( ( value, index ) => {
    if ( value < secondCorner[index] ) {
      secondCorner[index] -= OBSCURATION_CELL_SIZE;
    } else {
      secondCorner[index] += OBSCURATION_CELL_SIZE;
    }
  } );
  return {
    minLat: Math.min( firstCorner[0], secondCorner[0] ),
    minLng: Math.min( firstCorner[1], secondCorner[1] ),
    maxLat: Math.max( firstCorner[0], secondCorner[0] ),
    maxLng: Math.max( firstCorner[1], secondCorner[1] )
  };
}

type Props = {
  children?: any,
  className?: string,
  currentLocationButtonClassName?: string,
  mapHeight?: number|string, // allows for height to be defined as px or percentage
  mapType?: string,
  mapViewClassName?: string,
  mapViewRef?: Object,
  minZoomLevel?: number | null,
  obscured?: boolean,
  obsLatitude: number,
  obsLongitude: number,
  onMapReady?: Function,
  onPanDrag?: Function,
  onPermissionBlocked?: Function,
  onPermissionDenied?: Function,
  onPermissionGranted?: Function,
  onRegionChange?: Function,
  onRegionChangeComplete?: Function,
  onZoomToNearby?: Function,
  openMapScreen?: Function,
  permissionRequested?: boolean,
  positionalAccuracy?: number,
  region?: Object,
  showCurrentLocationButton?: boolean,
  showLocationIndicator?: boolean,
  showsCompass?: boolean,
  showSwitchMapTypeButton?: boolean,
  startAtNearby?: boolean,
  startAtUserLocation?: boolean,
  style?: Object,
  switchMapTypeButtonClassName?: string,
  testID?: string,
  tileMapParams?: Object,
  withObsTiles?: boolean,
  withPressableObsTiles?: boolean,
}

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

// TODO: fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = ( {
  children,
  className = "flex-1",
  currentLocationButtonClassName,
  mapHeight,
  mapType,
  mapViewClassName,
  mapViewRef: mapViewRefProp,
  minZoomLevel = 0, // default in react-native-maps
  obscured,
  obsLatitude,
  obsLongitude,
  onMapReady = ( ) => { },
  onPanDrag = ( ) => { },
  onPermissionBlocked: onPermissionBlockedProp,
  onPermissionDenied: onPermissionDeniedProp,
  onPermissionGranted: onPermissionGrantedProp,
  onRegionChange,
  onRegionChangeComplete,
  onZoomToNearby,
  openMapScreen,
  permissionRequested: permissionRequestedProp,
  positionalAccuracy,
  region,
  showCurrentLocationButton,
  showLocationIndicator,
  showsCompass,
  showSwitchMapTypeButton,
  startAtNearby = false,
  startAtUserLocation = false,
  style,
  switchMapTypeButtonClassName,
  testID,
  tileMapParams,
  withObsTiles,
  withPressableObsTiles
}: Props ): Node => {
  const { screenWidth } = useDeviceOrientation( );
  const [currentZoom, setCurrentZoom] = useState(
    region
      ? calculateZoom( screenWidth, region.longitudeDelta )
      : 5
  );
  const navigation = useNavigation( );
  const theme = useTheme( );
  const [permissionRequested, setPermissionRequested] = useState( permissionRequestedProp );
  const [showsUserLocation, setShowsUserLocation] = useState( false );
  const [userLocation, setUserLocation] = useState( null );
  const { t } = useTranslation( );
  const mapViewRef = useRef( mapViewRefProp );
  const [currentMapType, setCurrentMapType] = useState( mapType || "standard" );

  const initialLatitude = obsLatitude;
  const initialLongitude = obsLongitude;

  let initialRegion = {
    latitude: initialLatitude || 0,
    longitude: initialLongitude || 0,
    latitudeDelta: initialLatitude
      ? 0.2
      : 100,
    longitudeDelta: initialLatitude
      ? 0.2
      : 100
  };

  // Kind of obtuse, but the more obvious approach of making a function that
  // pans the map results in a function that gets recreated every time the
  // userLocation changes
  const [zoomToUserLocationRequested, setZoomToUserLocationRequested] = useState(
    startAtUserLocation
  );

  const [zoomToNearbyRequested, setZoomToNearbyRequested] = useState(
    startAtNearby
  );

  // Adapted from iNat Android LocationChooserActivity.java computeOffset function
  const EARTH_RADIUS = 6371000; // Earth radius in meters
  function metersToLatitudeDelta( meters, latitude ) {
    // Calculate latitude delta in radians
    const latitudeDeltaRadians
      = meters / ( EARTH_RADIUS * Math.cos( ( latitude * Math.PI ) / 180 ) );

    // Convert latitude delta to degrees
    const latitudeDelta = ( latitudeDeltaRadians * 180 ) / Math.PI;
    return latitudeDelta;
  }

  // Prop kind of functions as a signal. Would make more sense if it was
  // declarative and not reactive, but hey, it's React
  useEffect( ( ) => {
    if ( permissionRequestedProp && permissionRequested === null ) {
      setPermissionRequested( true );
    }
  }, [permissionRequestedProp, permissionRequested] );

  useEffect( ( ) => {
    if ( startAtNearby && zoomToNearbyRequested === null ) {
      setZoomToNearbyRequested( true );
    }
  }, [startAtNearby, zoomToNearbyRequested] );

  useEffect( () => {
    AsyncStorage.getItem( "mapType" ).then( value => {
      if ( value && !mapType ) {
        // Load last saved map type (unless explicitly overridden by the parent
        // of the Map component)
        setCurrentMapType( value );
      }
    } );
  }, [mapType, setCurrentMapType] );

  useEffect( ( ) => {
    if ( userLocation && zoomToUserLocationRequested && mapViewRef?.current ) {
      mapViewRef.current.animateToRegion( {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        // Zoom level based on location accuracy.
        latitudeDelta: metersToLatitudeDelta( userLocation.accuracy, userLocation.latitude ),
        // Intentional use of latitudeDelta here because longitudeDelta is harder to calculate
        longitudeDelta: metersToLatitudeDelta( userLocation.accuracy, userLocation.latitude )
      } );
      setZoomToUserLocationRequested( false );
    }
  }, [userLocation, zoomToUserLocationRequested] );

  // Zoom to nearby region if requested. Note that if you want to do something
  // after the map zooms, you need to use onRegionChangeComplete
  useEffect( ( ) => {
    if ( userLocation && zoomToNearbyRequested && mapViewRef?.current ) {
      mapViewRef.current?.animateToRegion( {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: metersToLatitudeDelta( NEARBY_DIM_M, userLocation.latitude ),
        longitudeDelta: metersToLatitudeDelta( NEARBY_DIM_M, userLocation.latitude )
      } );
      setZoomToNearbyRequested( false );
    }
  }, [
    onZoomToNearby,
    userLocation,
    zoomToNearbyRequested
  ] );

  // Kludge for the fact that the onUserLocationChange callback in MapView
  // won't fire if showsUserLocation is true on the first render
  useEffect( ( ) => {
    setShowsUserLocation( true );
  }, [] );

  // PermissionGate callbacks need to use useCallback, otherwise they'll
  // trigger re-renders if/when they change
  const onPermissionGranted = useCallback( ( ) => {
    if ( typeof ( onPermissionGrantedProp ) === "function" ) onPermissionGrantedProp( );
    setPermissionRequested( false );
    setShowsUserLocation( true );
    if ( startAtNearby ) {
      setZoomToNearbyRequested( true );
    }
  }, [
    onPermissionGrantedProp,
    setPermissionRequested,
    setZoomToNearbyRequested,
    startAtNearby
  ] );
  const onPermissionBlocked = useCallback( ( ) => {
    if ( typeof ( onPermissionBlockedProp ) === "function" ) onPermissionBlockedProp( );
    setPermissionRequested( false );
    setShowsUserLocation( false );
  }, [
    onPermissionBlockedProp,
    setPermissionRequested,
    setShowsUserLocation
  ] );
  const onPermissionDenied = useCallback( ( ) => {
    if ( typeof ( onPermissionDeniedProp ) === "function" ) onPermissionDeniedProp( );
    setPermissionRequested( false );
    setShowsUserLocation( false );
  }, [
    onPermissionDeniedProp,
    setPermissionRequested,
    setShowsUserLocation
  ] );

  const params = useMemo( ( ) => {
    const newTileParams: any = {
      color: "%2374ac00",
      ...tileMapParams
    };
    delete newTileParams.order;
    delete newTileParams.order_by;
    delete newTileParams.per_page;
    return newTileParams;
  }, [tileMapParams] );

  const changeMapType = async newMapType => {
    setCurrentMapType( newMapType );
    await AsyncStorage.setItem( "mapType", newMapType );
  };

  const obscurationCell = obscurationCellForLatLng( obsLatitude, obsLongitude );
  if ( obscured ) {
    initialRegion = {
      latitude: obscurationCell.minLat + ( OBSCURATION_CELL_SIZE / 2 ),
      longitude: obscurationCell.minLng + ( OBSCURATION_CELL_SIZE / 2 ),
      latitudeDelta: 0.3,
      longitudeDelta: 0.3
    };
  }

  const queryString = Object.keys( params ).map( key => `${key}=${params[key]}` ).join( "&" );

  const url = currentZoom > 13
    ? `${API_ENDPOINT}/points/{z}/{x}/{y}.png`
    : `${API_ENDPOINT}/grid/{z}/{x}/{y}.png`;
  const urlTemplate = `${url}?${queryString}`;

  const onMapPressForObsLyr = useCallback( async latLng => {
    const UTFPosition = createUTFPosition( currentZoom, latLng.latitude, latLng.longitude );
    const {
      mTilePositionX,
      mTilePositionY,
      mPixelPositionX,
      mPixelPositionY
    } = UTFPosition;
    const tilesParams = {
      ...params,
      style: "geotilegrid"
    };
    const gridQuery = Object.keys( tilesParams )
      .map( key => `${key}=${tilesParams[key]}` ).join( "&" );

    const gridUrl = `${POINT_TILES_ENDPOINT}/${currentZoom}/${mTilePositionX}/${mTilePositionY}`
      + ".grid.json";
    const gridUrlTemplate = `${gridUrl}?${gridQuery}`;

    const options = {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    };

    const response = await fetch( gridUrlTemplate, options );
    const json = await response.json( );

    const observation = getDataForPixel( mPixelPositionX, mPixelPositionY, json );
    const uuid = observation?.uuid;

    if ( uuid ) {
      navigation.navigate( "ObsDetails", { uuid } );
    }
  }, [params, currentZoom, navigation] );

  const locationIndicator = () => (
    // $FlowIgnore
    <LocationIndicator
      testID="Map.LocationIndicator"
      width={25}
      height={32}
    />
  );

  return (
    <View
      style={[
        mapHeight
          ? { height: mapHeight }
          : null
      ]}
      testID="MapView"
      className={classnames(
        "flex-1 h-full",
        mapViewClassName
      )}
    >
      <MapView
        ref={mapViewRef}
        testID={testID || "Map.MapView"}
        className={className}
        region={( region?.latitude )
          ? region
          : initialRegion}
        onRegionChange={async ( ) => {
          if ( onRegionChange ) { onRegionChange( ); }
        }}
        onUserLocationChange={async locationChangeEvent => {
          const coordinate = locationChangeEvent?.nativeEvent?.coordinate;
          if (
            coordinate?.latitude
            && coordinate.latitude.toFixed( 4 ) !== userLocation?.latitude.toFixed( 4 )
          ) {
            setUserLocation( coordinate );
          }
        }}
        showsUserLocation={showsUserLocation}
        loadingEnabled
        onRegionChangeComplete={async newRegion => {
          if ( onRegionChangeComplete ) {
            const boundaries = await mapViewRef?.current?.getMapBoundaries( );
            onRegionChangeComplete( newRegion, boundaries );
          }
          setCurrentZoom( calculateZoom( screenWidth, newRegion.longitudeDelta ) );
        }}
        onPress={e => {
          if ( withPressableObsTiles ) onMapPressForObsLyr( e.nativeEvent.coordinate );
          else if ( openMapScreen ) {
            openMapScreen( );
          }
        }}
        showsCompass={showsCompass}
        mapType={currentMapType}
        onMapReady={onMapReady}
        style={style}
        onPanDrag={onPanDrag}
        minZoomLevel={minZoomLevel}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {( withPressableObsTiles || withObsTiles ) && urlTemplate && (
          <UrlTile
            testID="Map.UrlTile"
            tileSize={512}
            urlTemplate={urlTemplate}
          />
        )}
        {( showLocationIndicator && ( !obscured ) ) && (
          <>
            <Circle
              center={{
                latitude: obsLatitude,
                longitude: obsLongitude
              }}
              radius={positionalAccuracy}
              strokeWidth={2}
              strokeColor="#74AC00"
              fillColor="rgba( 116, 172, 0, 0.2 )"
            />
            <Marker
              coordinate={{
                latitude: obsLatitude,
                longitude: obsLongitude
              }}
            >
              {locationIndicator()}
            </Marker>
          </>
        )}
        {( showLocationIndicator && obscured ) && (
          <Polygon
            coordinates={[
              {
                latitude: obscurationCell.minLat,
                longitude: obscurationCell.minLng
              },
              {
                latitude: obscurationCell.minLat,
                longitude: obscurationCell.maxLng
              },
              {
                latitude: obscurationCell.maxLat,
                longitude: obscurationCell.maxLng
              },
              {
                latitude: obscurationCell.maxLat,
                longitude: obscurationCell.minLng
              }
            ]}
            strokeWidth={2}
            strokeColor={colors.inatGreen}
            fillColor="rgba( 116, 172, 0, 0.2 )"
          />
        )}
      </MapView>
      { showCurrentLocationButton && (
        <INatIconButton
          icon="location-crosshairs"
          className={classnames(
            "absolute bottom-5 right-5 bg-white rounded-full",
            currentLocationButtonClassName
          )}
          style={getShadow( theme.colors.primary )}
          accessibilityLabel={t( "User-location" )}
          onPress={( ) => {
            setZoomToUserLocationRequested( true );
            setShowsUserLocation( true );
            setPermissionRequested( true );
          }}
        />
      )}
      {showSwitchMapTypeButton
        && (
          <INatIconButton
            icon="map-layers"
            className={classnames(
              "absolute bottom-5 left-5 bg-white rounded-full",
              switchMapTypeButtonClassName
            )}
            style={getShadow( theme.colors.primary )}
            accessibilityLabel={t( "User-location" )}
            onPress={( ) => {
              changeMapType( currentMapType === "standard"
                ? "satellite"
                : "standard" );
            }}
          />
        )}
      <LocationPermissionGate
        permissionNeeded={permissionRequested}
        onPermissionGranted={onPermissionGranted}
        onPermissionBlocked={onPermissionBlocked}
        onPermissionDenied={onPermissionDenied}
        withoutNavigation
      />
      {children}
    </View>
  );
};

export default Map;
