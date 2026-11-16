import type { PhotoTransform, Rect } from "sharedHelpers/cropZoomLayout";
import { getRegionUnderFrame, photoToScreen } from "sharedHelpers/cropZoomLayout";

interface Size {
  width: number;
  height: number;
}

// One side of the fit: where the frame starts on screen and how far the
// photo moves, given where the frame starts on the photo
const fitAxis = (
  areaSide: number,
  regionStart: number,
  frameSide: number,
  scale: number,
) => {
  // Centered in the area if possible: move the photo so the frame's start
  // on the photo lands there
  const centeredStart = ( areaSide - frameSide ) / 2;
  const idealTranslate = centeredStart - photoToScreen( regionStart, areaSide, scale, 0 );
  // CropZoom keeps the photo covering the whole area, so near the edge of the
  // photo the frame ends up off center, still inside the area
  const bound = ( areaSide * scale - areaSide ) / 2;
  const translate = Math.min( Math.max( idealTranslate, -bound ), bound );
  return {
    start: photoToScreen( regionStart, areaSide, scale, translate ),
    translate,
  };
};

// Grows the crop frame to fill as much of the crop area as it can at its own
// shape, and zooms the photo so the part under the frame stays under it.
// What will be cropped doesn't change, only how big it is on screen
const fitCropFrame = ( {
  frame,
  area,
  transform,
  maxScale,
}: {
  frame: Rect;
  area: Size;
  transform: PhotoTransform;
  maxScale: number;
} ): { frame: Rect; transform: PhotoTransform } => {
  const { scale } = transform;
  const growth = Math.min(
    area.width / frame.width,
    area.height / frame.height,
    // The frame can only grow as far as the photo can zoom
    maxScale / scale,
  );
  const newScale = scale * growth;
  const width = frame.width * growth;
  const height = frame.height * growth;
  const region = getRegionUnderFrame( frame, area, transform );
  const horizontal = fitAxis( area.width, region.x, width, newScale );
  const vertical = fitAxis( area.height, region.y, height, newScale );
  return {
    frame: {
      x: horizontal.start,
      y: vertical.start,
      width,
      height,
    },
    transform: {
      scale: newScale,
      translateX: horizontal.translate,
      translateY: vertical.translate,
    },
  };
};

export default fitCropFrame;
