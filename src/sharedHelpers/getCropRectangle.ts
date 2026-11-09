// Smallest crop, in pixels, along the image's shorter side. Matches the
// "medium" size iNat serves (500px), so a cropped photo is never smaller than
// what most of the app displays
export const MINIMUM_CROP_SIZE = 500;

interface CropInput {
  // Pixel size of the image being cropped
  imageWidth: number;
  imageHeight: number;
  // On-screen size of the crop frame. At scale 1 the image fills the frame
  // exactly, so the frame has the same aspect ratio as the image
  frameWidth: number;
  frameHeight: number;
  // Zoom applied to the image around the frame's center; 1 means no zoom
  scale: number;
  // On-screen pan of the image, in points, measured after scaling
  translateX: number;
  translateY: number;
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

const cropAxis = (
  imageSize: number,
  frameSize: number,
  translate: number,
  scale: number,
  effectiveScale: number,
) => {
  const pixelsPerPoint = imageSize / frameSize;
  // The image pixel under the center of the frame
  const center = ( frameSize / 2 - translate / scale ) * pixelsPerPoint;
  const size = Math.min( Math.round( imageSize / effectiveScale ), imageSize );
  const start = clamp( Math.round( center - size / 2 ), 0, imageSize - size );
  return { start, end: start + size };
};

// Converts the zoom and pan of an image under a fixed crop frame into the
// pixel rectangle of the image that the frame shows
const getCropRectangle = ( {
  imageWidth,
  imageHeight,
  frameWidth,
  frameHeight,
  scale,
  translateX,
  translateY,
  minimumCropSize = MINIMUM_CROP_SIZE,
}: CropInput ): CropRectangle => {
  // Limit zoom so the shorter side never drops below the minimum crop size,
  // while keeping the user's chosen center
  const shorterSide = Math.min( imageWidth, imageHeight );
  const maximumScale = Math.max( 1, shorterSide / minimumCropSize );
  const effectiveScale = clamp( scale, 1, maximumScale );

  const horizontal = cropAxis( imageWidth, frameWidth, translateX, scale, effectiveScale );
  const vertical = cropAxis( imageHeight, frameHeight, translateY, scale, effectiveScale );

  return {
    startX: horizontal.start,
    startY: vertical.start,
    endX: horizontal.end,
    endY: vertical.end,
  };
};

export default getCropRectangle;
