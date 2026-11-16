interface Size {
  width: number;
  height: number;
}

interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

// How CropZoom shows the photo inside the crop area. The photo is laid out
// at the size of the area, centered, then scaled around its center and moved
interface PhotoTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

// One side of the fit: where the frame starts on screen and how far the
// photo moves, given the part of the photo under the frame
const fitAxis = (
  areaSide: number,
  // Where the frame starts, in points across the photo laid out unscaled
  regionStart: number,
  frameSide: number,
  scale: number,
) => {
  const center = areaSide / 2;
  // Centered in the area if possible
  const centeredStart = ( areaSide - frameSide ) / 2;
  const idealTranslate = centeredStart - center - ( regionStart - center ) * scale;
  // CropZoom keeps the photo covering the whole area, so near the edge of the
  // photo the frame ends up off center, still inside the area
  const bound = ( areaSide * scale - areaSide ) / 2;
  const translate = Math.min( Math.max( idealTranslate, -bound ), bound );
  return {
    start: center + translate + ( regionStart - center ) * scale,
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
  frame: Frame;
  area: Size;
  transform: PhotoTransform;
  maxScale: number;
} ): { frame: Frame; transform: PhotoTransform } => {
  const { scale, translateX, translateY } = transform;
  const growth = Math.min(
    area.width / frame.width,
    area.height / frame.height,
    // The frame can only grow as far as the photo can zoom
    maxScale / scale,
  );
  const newScale = scale * growth;
  const width = frame.width * growth;
  const height = frame.height * growth;
  // The frame's top-left corner in the photo, laid out unscaled
  const regionX = ( frame.x - area.width / 2 - translateX ) / scale + area.width / 2;
  const regionY = ( frame.y - area.height / 2 - translateY ) / scale + area.height / 2;
  const horizontal = fitAxis( area.width, regionX, width, newScale );
  const vertical = fitAxis( area.height, regionY, height, newScale );
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
