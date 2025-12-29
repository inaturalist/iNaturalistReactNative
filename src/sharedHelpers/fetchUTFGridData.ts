// adapted from native Android iNaturalist app
// https://github.com/inaturalist/iNaturalistAndroid/blob/main/iNaturalist/src/main/java/org/inaturalist/android/UTFGrid.java

interface UTFGrid {
  grid: string[];
  keys: string[];
  data?: Record<string, unknown>;
}

const EXPANSION_PIXELS = 16;

const TILE_SIZE = 256;
const EMPTY_KEY = "";

const decodeId = ( id: number ): number => {
  let decodedId = id;
  if ( id >= 93 ) decodedId -= 1;
  if ( id >= 35 ) decodedId -= 1;
  decodedId -= 32;
  return decodedId;
};

const getKeyForPixel = ( row: number, col: number, json: UTFGrid ): string => {
  let id = 0;

  if ( ( row >= 0 ) && ( col >= 0 )
    && ( row < json.grid.length ) && ( col < json.grid.length ) ) {
    id = json.grid[row].charCodeAt( col );
    id = decodeId( id );

    if ( id < 0 || id >= json.keys.length ) {
      id = 0;
    }
  }

  const key = json.keys[id];

  return key;
};

const getKeyForPixelExpansive = (
  x: number,
  y: number,
  json: UTFGrid,
): string | null => {
  if ( !json?.grid ) return null;
  const factor = TILE_SIZE / json.grid.length;

  // Convert x/y to row/column, while making sure it's within the bounds of the grid
  const initialRow = Math.floor(
    Math.min( Math.max( y / factor, 0 ), json.grid.length - 1 ),
  );
  const initialCol = Math.floor(
    Math.min( Math.max( x / factor, 0 ), json.grid.length - 1 ),
  );

  let key = getKeyForPixel( initialRow, initialCol, json );
  if ( key !== EMPTY_KEY ) return key;

  // Search nearby pixels

  // Search up to EXPANSION_PIXELS pixels away from all directions -
  // Slowly expand the search grid around the current pixel
  for ( let radius = 1; radius <= EXPANSION_PIXELS; radius += 1 ) {
    for ( let row = initialRow - radius; row <= initialRow + radius; row += 1 ) {
      for ( let col = initialCol - radius; col <= initialCol + radius; col += 1 ) {
        if ( row !== initialRow - radius && row !== initialRow + radius
          && col !== initialCol - radius && col !== initialCol + radius ) {
          // Skip the iteration for points that are not on the perimeter of the current square
        } else {
          key = getKeyForPixel( row, col, json );
          if ( key !== EMPTY_KEY ) {
            return key;
          }
        }
      }
    }
  }

  return EMPTY_KEY;
};

/** Returns the data object corresponding to the given tile position
   * @return data object corresponding to the tile position (null if no data for that position)
   */
const getDataForPixel = (
  x: number,
  y: number,
  json: UTFGrid | null | undefined,
): unknown | null => {
  if ( !json || !json?.data || !json?.grid ) return null;

  const key = getKeyForPixelExpansive( x, y, json );

  // Non existent key
  if ( key === null || !json.data[key] ) { return null; }

  return json.data[key];
};

export default getDataForPixel;
