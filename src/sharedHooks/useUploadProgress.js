// @flow
import type { Node } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";

type Props = {
  children: Node
};

export const UploadProgressContext: Object = createContext<Function>( {} );

export const UploadProgressProvider = ( { children }: Props ): Node => {
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

const useUploadProgress = (): Object => useContext( UploadProgressContext );

export default useUploadProgress;
