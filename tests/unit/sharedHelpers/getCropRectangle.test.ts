import getCropRectangle, { MINIMUM_CROP_SIZE } from "sharedHelpers/getCropRectangle";

// A 2048x1536 photo shown in a 400x300 frame, so 1 point = 5.12 pixels
const photoInFrame = {
  imageWidth: 2048,
  imageHeight: 1536,
  frameWidth: 400,
  frameHeight: 300,
};

describe( "getCropRectangle", ( ) => {
  it( "returns the whole image when not zoomed or panned", ( ) => {
    expect( getCropRectangle( {
      ...photoInFrame,
      scale: 1,
      translateX: 0,
      translateY: 0,
    } ) ).toEqual( {
      startX: 0, startY: 0, endX: 2048, endY: 1536,
    } );
  } );

  it( "maps zoom and pan to the part of the image inside the frame", ( ) => {
    // At 2x, a 100pt pan right moves the frame's center 50pt left in the
    // image: 150pt * 5.12 = pixel 768
    expect( getCropRectangle( {
      ...photoInFrame,
      scale: 2,
      translateX: 100,
      translateY: 0,
    } ) ).toEqual( {
      startX: 256, startY: 384, endX: 1280, endY: 1152,
    } );
  } );

  it( "keeps the crop inside the image when panned past an edge", ( ) => {
    const crop = getCropRectangle( {
      ...photoInFrame,
      scale: 2,
      translateX: 400,
      translateY: -400,
    } );
    expect( crop ).toEqual( {
      startX: 0, startY: 768, endX: 1024, endY: 1536,
    } );
  } );

  it( "does not crop the shorter side below the minimum size", ( ) => {
    // A zoom far beyond what the minimum allows
    const crop = getCropRectangle( {
      ...photoInFrame,
      scale: 1000,
      translateX: 0,
      translateY: 0,
    } );
    expect( crop.endY - crop.startY ).toBe( MINIMUM_CROP_SIZE );
    // The longer side keeps the photo's 4:3 aspect ratio
    expect( crop.endX - crop.startX ).toBe( Math.round( MINIMUM_CROP_SIZE * ( 4 / 3 ) ) );
  } );
} );
