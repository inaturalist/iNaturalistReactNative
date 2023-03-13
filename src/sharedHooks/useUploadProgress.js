// @flow
import { UploadProgressContext } from "providers/contexts";
import { useContext } from "react";

const useUploadProgress = (): Object => useContext( UploadProgressContext );

export default useUploadProgress;
