import getCropRectangle, { MINIMUM_CROP_SIZE } from "sharedHelpers/getCropRectangle";

// A 2048x1536 photo shown 400pt wide (and so 300pt tall): 1 point = 5.12 pixels
const photoOnScreen = {
  imageWidth: 2048,
  imageHeight: 1536,
  displayWidth: 400,
};

describe( "getCropRectangle", ( ) => {
  it( "returns the whole image when the frame covers the whole photo", ( ) => {
    expect( getCropRectangle( {
      ...photoOnScreen,
      frame: { x: 0, y: 0, width: 400 },
    } ) ).toEqual( {
      startX: 0, startY: 0, endX: 2048, endY: 1536,
    } );
  } );

  it( "maps the frame to the part of the image it covers", ( ) => {
    // A 200x150pt frame centered on the photo covers the middle quarter
    expect( getCropRectangle( {
      ...photoOnScreen,
      frame: { x: 100, y: 75, width: 200 },
    } ) ).toEqual( {
      startX: 512, startY: 384, endX: 1536, endY: 1152,
    } );
  } );

  it( "keeps the crop inside the image when the frame hangs past an edge", ( ) => {
    expect( getCropRectangle( {
      ...photoOnScreen,
      frame: { x: 300, y: -50, width: 200 },
    } ) ).toEqual( {
      startX: 1024, startY: 0, endX: 2048, endY: 768,
    } );
  } );

  it( "does not crop the shorter side below the minimum size", ( ) => {
    const crop = getCropRectangle( {
      ...photoOnScreen,
      frame: { x: 190, y: 140, width: 1 },
    } );
    expect( crop.endY - crop.startY ).toBe( MINIMUM_CROP_SIZE );
    // The longer side keeps the photo's 4:3 aspect ratio
    expect( crop.endX - crop.startX ).toBe( Math.round( MINIMUM_CROP_SIZE * ( 4 / 3 ) ) );
  } );
} );
