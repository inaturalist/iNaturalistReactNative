// adapted from native Android iNaturalist app
// https://github.com/inaturalist/iNaturalistAndroid/blob/main/iNaturalist/src/main/java/org/inaturalist/android/UTFGrid.java

const EXPANSION_PIXELS = 8;

const TILE_SIZE = 256;
const EMPTY_KEY = "";

const decodeId = id => {
  let decodedId = id;
  if ( id >= 93 || id >= 35 ) {
    decodedId -= 1;
  } else {
    decodedId -= 32;
  }
  return decodedId;
};

const getKeyForPixel = ( x, y, json ) => {
  let id = 0;

  if (
    x >= 0
      && y >= 0
      && x < TILE_SIZE
      && y < TILE_SIZE
  ) {
    const factor = TILE_SIZE / json.grid.length;
    const row = Math.floor( y / factor );
    const col = Math.floor( x / factor );

    id = json.grid[row].charCodeAt( col );
    id = decodeId( id );

    if ( id < 0 || id >= json.keys.length ) {
      id = 0;
    }
  }

  const key = json.keys[id];

  return key;
};

const getKeyForPixelExpansive = ( x, y, json ) => {
  let key = getKeyForPixel( x, y, json );
  if ( key !== EMPTY_KEY ) return key;

  // Search nearby pixels
  const factor = TILE_SIZE / json.grid.length;
  // Search up to EXPANSION_PIXELS pixels away from all directions
  const expansionFactor = EXPANSION_PIXELS * factor;

  // Slowly expand the search grid around the current pixel
  for ( let expansion = factor; expansion <= expansionFactor; expansion += factor ) {
    key = getKeyForPixel( x - expansion, y - expansion, json );
    if ( key !== EMPTY_KEY ) return key;
    key = getKeyForPixel( x, y - expansion, json );
    if ( key !== EMPTY_KEY ) return key;
    key = getKeyForPixel( x + expansion, y - expansion, json );
    if ( key !== EMPTY_KEY ) return key;
    key = getKeyForPixel( x + expansion, y, json );
    if ( key !== EMPTY_KEY ) return key;
    key = getKeyForPixel( x + expansion, y + expansion, json );
    if ( key !== EMPTY_KEY ) return key;
    key = getKeyForPixel( x, y + expansion, json );
    if ( key !== EMPTY_KEY ) return key;
    key = getKeyForPixel( x - expansion, y + expansion, json );
    if ( key !== EMPTY_KEY ) return key;
    key = getKeyForPixel( x - expansion, y, json );
    if ( key !== EMPTY_KEY ) return key;
  }

  return EMPTY_KEY;
};

/** Returns the data object corresponding to the given tile position
   * @return data object corresponding to the tile position (null if no data for that position)
   */
const getDataForPixel = ( x, y, json ) => {
  const key = getKeyForPixelExpansive( x, y, json );

  // Non existent key
  if ( !json.data[key] ) { return null; }

  return json.data[key];
};

export default getDataForPixel;
