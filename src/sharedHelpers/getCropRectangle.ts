// Smallest crop, in pixels, along each side. Matches the "medium" size iNat
// serves (500px), so a cropped photo is never smaller than what most of the
// app displays, unless the photo itself is smaller
export const MINIMUM_CROP_SIZE = 500;

// A rectangle of the photo, in its pixels
interface PhotoArea {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

interface CropInput {
  // Pixel size of the photo being cropped
  imageWidth: number;
  imageHeight: number;
  // The crop area on screen, in points. The photo may be zoomed and panned
  // inside it
  areaWidth: number;
  areaHeight: number;
  // The part of the photo the crop area shows, in pixels
  visibleArea: PhotoArea;
  // The crop frame, in points from the crop area's top-left corner. It can be
  // any shape
  frame: {
    x: number;
    y: number;
    width: number;
    height: number;
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

// The smallest share of a side of the photo a crop may cover
export const getMinimumCropFraction = (
  imageSide: number,
  minimumCropSize = MINIMUM_CROP_SIZE,
) => Math.min( 1, minimumCropSize / imageSide );

// One side of the crop: its size is kept between the minimum and the whole
// side, growing around its center, and it is kept inside the photo
const cropAxis = (
  imageSide: number,
  center: number,
  size: number,
  minimumCropSize: number,
) => {
  const minimumSize = Math.min( minimumCropSize, imageSide );
  const clampedSize = Math.round( clamp( size, minimumSize, imageSide ) );
  const start = clamp( Math.round( center - clampedSize / 2 ), 0, imageSide - clampedSize );
  return { start, end: start + clampedSize };
};

// Converts a crop frame drawn over a zoomed and panned photo into the pixel
// rectangle of the photo it covers
const getCropRectangle = ( {
  imageWidth,
  imageHeight,
  areaWidth,
  areaHeight,
  visibleArea,
  frame,
  minimumCropSize = MINIMUM_CROP_SIZE,
}: CropInput ): CropRectangle => {
  const pixelsPerPointX = visibleArea.width / areaWidth;
  const pixelsPerPointY = visibleArea.height / areaHeight;
  const horizontal = cropAxis(
    imageWidth,
    visibleArea.originX + ( frame.x + frame.width / 2 ) * pixelsPerPointX,
    frame.width * pixelsPerPointX,
    minimumCropSize,
  );
  const vertical = cropAxis(
    imageHeight,
    visibleArea.originY + ( frame.y + frame.height / 2 ) * pixelsPerPointY,
    frame.height * pixelsPerPointY,
    minimumCropSize,
  );
  return {
    startX: horizontal.start,
    startY: vertical.start,
    endX: horizontal.end,
    endY: vertical.end,
  };
};

export default getCropRectangle;
