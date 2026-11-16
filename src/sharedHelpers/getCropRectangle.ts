import type { PhotoTransform, Rect } from "sharedHelpers/cropZoomLayout";
import { getRegionUnderFrame } from "sharedHelpers/cropZoomLayout";

// Smallest crop, in pixels, along each side, unless the photo itself is
// smaller. Ideally low enough for tight crops of small organisms but high enough that
// the crop still has enough detail to identify
export const MINIMUM_CROP_SIZE = 250;

interface CropInput {
  // Pixel size of the photo being cropped
  imageWidth: number;
  imageHeight: number;
  // The crop area on screen, in points
  area: {
    width: number;
    height: number;
  };
  // How CropZoom has zoomed and panned the photo inside the crop area
  transform: PhotoTransform;
  // The crop frame, in points from the crop area's top-left corner. It can be
  // any shape
  frame: Rect;
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
  area,
  transform,
  frame,
  minimumCropSize = MINIMUM_CROP_SIZE,
}: CropInput ): CropRectangle => {
  const region = getRegionUnderFrame( frame, area, transform );
  const pixelsPerPointX = imageWidth / area.width;
  const pixelsPerPointY = imageHeight / area.height;
  const horizontal = cropAxis(
    imageWidth,
    ( region.x + region.width / 2 ) * pixelsPerPointX,
    region.width * pixelsPerPointX,
    minimumCropSize,
  );
  const vertical = cropAxis(
    imageHeight,
    ( region.y + region.height / 2 ) * pixelsPerPointY,
    region.height * pixelsPerPointY,
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
