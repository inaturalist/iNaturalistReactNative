// Smallest crop, in pixels, along the image's shorter side. Matches the
// "medium" size iNat serves (500px), so a cropped photo is never smaller than
// what most of the app displays
export const MINIMUM_CROP_SIZE = 500;

interface CropInput {
  // Pixel size of the image being cropped
  imageWidth: number;
  imageHeight: number;
  // On-screen width of the image. It is shown at its own aspect ratio, so
  // this also sets its on-screen height
  displayWidth: number;
  // The crop frame on screen, in points from the image's top-left corner.
  // The frame keeps the image's aspect ratio, so its width sets its height
  frame: {
    x: number;
    y: number;
    width: number;
  };
  minimumCropSize?: number;
}

// Matches the arguments of nitro-image's Image.crop: absolute pixel
// coordinates where width = endX - startX
export interface CropRectangle {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const clamp = ( value: number, minimum: number, maximum: number ) => (
  Math.min( Math.max( value, minimum ), maximum )
);

// The smallest share of the image a crop may cover, so the crop's shorter
// side stays at or above the minimum size
export const getMinimumCropFraction = (
  imageWidth: number,
  imageHeight: number,
  minimumCropSize = MINIMUM_CROP_SIZE,
) => Math.min( 1, minimumCropSize / Math.min( imageWidth, imageHeight ) );

const cropAxis = ( imageSize: number, center: number, fraction: number ) => {
  const size = Math.round( imageSize * fraction );
  const start = clamp( Math.round( center - size / 2 ), 0, imageSize - size );
  return { start, end: start + size };
};

// Converts a crop frame drawn over an image on screen into the pixel
// rectangle of the image it covers
const getCropRectangle = ( {
  imageWidth,
  imageHeight,
  displayWidth,
  frame,
  minimumCropSize = MINIMUM_CROP_SIZE,
}: CropInput ): CropRectangle => {
  const pixelsPerPoint = imageWidth / displayWidth;
  // Share of the image the frame covers. It is the same on both axes because
  // the frame keeps the image's aspect ratio
  const frameFraction = frame.width / displayWidth;
  // The image pixel under the center of the frame
  const centerX = frame.x * pixelsPerPoint + ( frameFraction * imageWidth ) / 2;
  const centerY = frame.y * pixelsPerPoint + ( frameFraction * imageHeight ) / 2;

  // Keep the shorter side at or above the minimum, growing around the
  // frame's center
  const minimumFraction = getMinimumCropFraction( imageWidth, imageHeight, minimumCropSize );
  const fraction = clamp( frameFraction, minimumFraction, 1 );

  const horizontal = cropAxis( imageWidth, centerX, fraction );
  const vertical = cropAxis( imageHeight, centerY, fraction );

  return {
    startX: horizontal.start,
    startY: vertical.start,
    endX: horizontal.end,
    endY: vertical.end,
  };
};

export default getCropRectangle;
