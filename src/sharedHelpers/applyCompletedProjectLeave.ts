import type {
  RealmProjectObservationPojo,
} from "realmModels/types";

interface ObservationForProjectLeave {
  projectObservations?: RealmProjectObservationPojo[];
}
export default function applyCompletedProjectLeave(
  currentObservation: ObservationForProjectLeave | null | undefined,
) {
  const {
    projectObservations,
  } = currentObservation ?? {};
  return {
    projectObservations,
  };
}
