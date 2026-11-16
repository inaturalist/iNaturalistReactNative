import fitCropFrame from "sharedHelpers/fitCropFrame";
import getCropRectangle from "sharedHelpers/getCropRectangle";

// A 400x300pt crop area showing a 2048x1536 photo, which CropZoom can zoom
// until 1 point shows 1 pixel
const area = { width: 400, height: 300 };
const maxScale = 2048 / 400;
const notZoomed = { scale: 1, translateX: 0, translateY: 0 };

// The pixels a frame crops. Snapping the frame shouldn't change them
const getCrop = ( frame, transform ) => getCropRectangle( {
  imageWidth: 2048,
  imageHeight: 1536,
  area,
  transform,
  frame,
} );

describe( "fitCropFrame", ( ) => {
  it( "grows the frame to fill the area, centered, keeping the crop", ( ) => {
    // A 100x150pt frame in the middle of the photo
    const frame = {
      x: 150, y: 75, width: 100, height: 150,
    };
    const fitted = fitCropFrame( {
      frame, area, transform: notZoomed, maxScale,
    } );
    // As tall as the area, at the frame's 2:3 shape, centered
    expect( fitted.frame ).toEqual( {
      x: 100, y: 0, width: 200, height: 300,
    } );
    expect( fitted.transform.scale ).toEqual( 2 );
    expect( getCrop( fitted.frame, fitted.transform ) )
      .toEqual( getCrop( frame, notZoomed ) );
  } );

  it( "leaves the frame off center rather than show past the photo's edge", ( ) => {
    // A frame over the photo's top-left corner
    const frame = {
      x: 0, y: 0, width: 100, height: 100,
    };
    const fitted = fitCropFrame( {
      frame, area, transform: notZoomed, maxScale,
    } );
    // The photo still covers the area, so the frame stays in its corner
    expect( fitted.frame ).toEqual( {
      x: 0, y: 0, width: 300, height: 300,
    } );
    expect( getCrop( fitted.frame, fitted.transform ) )
      .toEqual( getCrop( frame, notZoomed ) );
  } );

  it( "only grows the frame as far as the photo can zoom", ( ) => {
    const frame = {
      x: 175, y: 125, width: 50, height: 50,
    };
    const fitted = fitCropFrame( {
      frame, area, transform: notZoomed, maxScale: 2,
    } );
    expect( fitted.transform.scale ).toEqual( 2 );
    expect( fitted.frame ).toEqual( {
      x: 150, y: 100, width: 100, height: 100,
    } );
  } );
} );
