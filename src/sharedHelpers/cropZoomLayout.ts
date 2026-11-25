// Where things are on screen in react-native-zoom-toolkit's CropZoom.
// CropZoom lays the photo out at the size of the crop area, centered, then
// scales it around its center and moves it. A point "on the photo" here is in
// points across that layout before zooming; multiply by the photo's pixels
// per point of the area to get pixels.
//
// This assumes CropZoom never rotates or flips the photo. Rotating happens
// separately, in editLocalPhoto, so calling cropZoom.rotate() or flipping it
// would put every crop in the wrong place

export interface PhotoTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

// One side of the crop area: a point on screen to a point on the photo
export const screenToPhoto = (
  point: number,
  areaSide: number,
  scale: number,
  translate: number,
) => ( point - areaSide / 2 - translate ) / scale + areaSide / 2;

// One side of the crop area: a point on the photo to a point on screen
export const photoToScreen = (
  point: number,
  areaSide: number,
  scale: number,
  translate: number,
) => areaSide / 2 + translate + ( point - areaSide / 2 ) * scale;

// The part of the photo under the crop frame
export const getRegionUnderFrame = (
  frame: Rect,
  area: Size,
  { scale, translateX, translateY }: PhotoTransform,
): Rect => ( {
  x: screenToPhoto( frame.x, area.width, scale, translateX ),
  y: screenToPhoto( frame.y, area.height, scale, translateY ),
  width: frame.width / scale,
  height: frame.height / scale,
} );
