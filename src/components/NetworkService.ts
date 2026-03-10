import {
  useIconicTaxa,
  useObservationUpdatesWhenFocused,
} from "sharedHooks";

import useTaxonCommonNames from "./hooks/useTaxonCommonNames";
import useWorkQueue from "./hooks/useWorkQueue";

const NetworkService = ( ) => {
  useObservationUpdatesWhenFocused( );

  useIconicTaxa( { reload: true } );
  // This only runs when App updates... which is rarely. It works for Settings
  // b/c it generally updates currentUser
  useWorkQueue( );
  useTaxonCommonNames( );

  return null;
};

export default NetworkService;
