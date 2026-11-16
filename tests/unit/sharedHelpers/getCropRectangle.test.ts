import getCropRectangle, { MINIMUM_CROP_SIZE } from "sharedHelpers/getCropRectangle";

// A 2048x1536 photo in a 400x300pt crop area
const photoOnScreen = {
  imageWidth: 2048,
  imageHeight: 1536,
  area: { width: 400, height: 300 },
};
// Not zoomed: the crop area shows the whole photo, so 1 point = 5.12 pixels
const notZoomed = { scale: 1, translateX: 0, translateY: 0 };

describe( "getCropRectangle", ( ) => {
  it( "returns the whole image when the frame covers the whole photo", ( ) => {
    expect( getCropRectangle( {
      ...photoOnScreen,
      transform: notZoomed,
      frame: {
        x: 0, y: 0, width: 400, height: 300,
      },
    } ) ).toEqual( {
      startX: 0, startY: 0, endX: 2048, endY: 1536,
    } );
  } );

  it( "maps a frame of any shape to the part of the image it covers", ( ) => {
    // A wide 300x100pt frame, 50pt in from the left and top
    expect( getCropRectangle( {
      ...photoOnScreen,
      transform: notZoomed,
      frame: {
        x: 50, y: 50, width: 300, height: 100,
      },
    } ) ).toEqual( {
      startX: 256, startY: 256, endX: 1792, endY: 768,
    } );
  } );

  it( "maps the frame to the part of a zoomed photo it covers", ( ) => {
    // Zoomed in 2x on the photo's center: the area shows its middle quarter,
    // so 1 point = 2.56 pixels
    expect( getCropRectangle( {
      ...photoOnScreen,
      transform: { scale: 2, translateX: 0, translateY: 0 },
      frame: {
        x: 0, y: 0, width: 300, height: 225,
      },
    } ) ).toEqual( {
      startX: 512, startY: 384, endX: 1280, endY: 960,
    } );
  } );

  it( "maps the frame to the part of a zoomed and panned photo it covers", ( ) => {
    // Zoomed in 2x, then moved right and down to show the top-left quarter
    expect( getCropRectangle( {
      ...photoOnScreen,
      transform: { scale: 2, translateX: 200, translateY: 150 },
      frame: {
        x: 0, y: 0, width: 400, height: 300,
      },
    } ) ).toEqual( {
      startX: 0, startY: 0, endX: 1024, endY: 768,
    } );
  } );

  it( "does not crop either side below the minimum size", ( ) => {
    const crop = getCropRectangle( {
      ...photoOnScreen,
      transform: notZoomed,
      frame: {
        x: 190, y: 140, width: 20, height: 1,
      },
    } );
    expect( crop.endX - crop.startX ).toBe( MINIMUM_CROP_SIZE );
    expect( crop.endY - crop.startY ).toBe( MINIMUM_CROP_SIZE );
  } );

  it( "keeps a crop grown to the minimum size inside the image", ( ) => {
    const crop = getCropRectangle( {
      ...photoOnScreen,
      transform: notZoomed,
      frame: {
        x: 0, y: 0, width: 10, height: 10,
      },
    } );
    expect( crop ).toEqual( {
      startX: 0, startY: 0, endX: MINIMUM_CROP_SIZE, endY: MINIMUM_CROP_SIZE,
    } );
  } );
} );
