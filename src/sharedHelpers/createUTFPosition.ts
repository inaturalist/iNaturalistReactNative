const TILE_SIZE = 256;

let mPixelPositionX;
let mPixelPositionY;
let mTilePositionX;
let mTilePositionY;

/* Based on: https://developers.google.com/maps/documentation/javascript/examples/map-coordinates */
const project = ( latitude: number, longitude: number ) => {
  let siny = Math.sin( ( latitude * Math.PI ) / 180 );

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = Math.min( Math.max( siny, -0.9999 ), 0.9999 );

  return [
    ( 256 * ( 0.5 + longitude / 360 ) ),
    ( 256 * ( 0.5 - Math.log( ( 1 + siny ) / ( 1 - siny ) ) / ( 4 * Math.PI ) ) ),
  ];
};

/* Based on: https://developers.google.com/maps/documentation/javascript/examples/map-coordinates */
const createUTFPosition = ( zoomLevel: number, latitude: number, longitude: number ) => {
  const scale = 2 ** Math.floor( zoomLevel );

  const worldCoordinate = project( latitude, longitude );
  mTilePositionX = Math.floor( ( worldCoordinate[0] * scale ) / TILE_SIZE );
  mTilePositionY = Math.floor( ( worldCoordinate[1] * scale ) / TILE_SIZE );

  const pixelCoordinate = [
    worldCoordinate[0] * scale,
    worldCoordinate[1] * scale,
  ];

  mPixelPositionX = ( pixelCoordinate[0] - mTilePositionX * TILE_SIZE );
  mPixelPositionY = ( pixelCoordinate[1] - mTilePositionY * TILE_SIZE );

  return {
    mPixelPositionX,
    mPixelPositionY,
    mTilePositionX,
    mTilePositionY,
  };
};

export default createUTFPosition;
