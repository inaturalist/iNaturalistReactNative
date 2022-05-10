// @flow
import { createContext } from "react";

const ExploreContext: Object = createContext<Function>( );
const ObsEditContext: Object = createContext<Function>( );
const PhotoGalleryContext: Object = createContext<Function>( );

export {
  ExploreContext,
  ObsEditContext,
  PhotoGalleryContext
};
