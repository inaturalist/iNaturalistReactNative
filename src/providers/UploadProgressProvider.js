// @flow
import type { Node } from "react";
import React, {
  useCallback,
  useMemo,
  useState
} from "react";

import { UploadProgressContext } from "./contexts";

type Props = {
  children: Node
};

const UploadProgressProvider = ( { children }: Props ): Node => {
  const [uploadProgress, setUploadProgress] = useState( {} );

  const setObservationProgress = useCallback(
    ( observationId, progress ) => {
      setUploadProgress( currentUploadProgress => {
        currentUploadProgress[observationId] = progress;

        return { ...currentUploadProgress };
      } );
    },
    [setUploadProgress]
  );

  const cleanup = useCallback( () => setUploadProgress( {} ), [setUploadProgress] );

  const providerData = useMemo(
    () => ( {
      uploadProgress,
      setObservationProgress,
      cleanup
    } ),
    [uploadProgress, setObservationProgress, cleanup]
  );

  return (
    <UploadProgressContext.Provider value={providerData}>
      {children}
    </UploadProgressContext.Provider>
  );
};

export default UploadProgressProvider;
