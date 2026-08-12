import type Realm from "realm";
import Observation from "realmModels/Observation";

interface TotalUploadProgressItem {
  uuid: string;
  totalProgress: number;
}

// Shared by any per-item renderer that needs the same unsynced/queued/progress
// values ObservationsFlashList's renderItem computes inline
const getObservationUploadStatus = (
  realm: Realm,
  uploadQueue: string[],
  totalUploadProgress: TotalUploadProgressItem[],
  uuid: string,
) => {
  const obsNeedsSync = Observation.isUnsyncedObservation( realm, { uuid } );
  const obsUploadState = totalUploadProgress.find( o => o.uuid === uuid );
  const uploadProgress = obsNeedsSync
    ? obsUploadState?.totalProgress || 0
    : obsUploadState?.totalProgress;
  const queued = uploadQueue.includes( uuid );

  return { obsNeedsSync, queued, uploadProgress };
};

export default getObservationUploadStatus;
