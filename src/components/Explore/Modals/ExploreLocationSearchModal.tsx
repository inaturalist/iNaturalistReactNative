import type { ApiPlace } from "api/types";
import ExploreLocationSearch from "components/Explore/SearchScreens/ExploreLocationSearch.tsx";
import Modal from "components/SharedComponents/Modal.tsx";
import React from "react";
import type { LocationPermissionCallbacks } from "sharedHooks/useLocationPermission.tsx";

interface Props {
  closeModal: () => void;
  hasPermissions?: boolean;
  renderPermissionsGate: ( options: LocationPermissionCallbacks ) => React.FC;
  requestPermissions: ( ) => void;
  showModal: boolean;
  updateLocation: ( location: "worldwide" | ApiPlace ) => void;
}

const ExploreLocationSearchModal = ( {
  closeModal,
  hasPermissions,
  renderPermissionsGate,
  requestPermissions,
  showModal,
  updateLocation
}: Props ) => (
  <Modal
    showModal={showModal}
    fullScreen
    closeModal={closeModal}
    disableSwipeDirection
    modal={(
      <ExploreLocationSearch
        closeModal={closeModal}
        hasPermissions={hasPermissions}
        renderPermissionsGate={renderPermissionsGate}
        requestPermissions={requestPermissions}
        updateLocation={updateLocation}
      />
    )}
  />
);

export default ExploreLocationSearchModal;
