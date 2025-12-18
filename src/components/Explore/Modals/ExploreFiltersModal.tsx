import Modal from "components/SharedComponents/Modal";
import React from "react";

import FilterModal from "./FilterModal";

interface Props extends Pick<
  React.ComponentProps<typeof FilterModal>,
  | "closeModal"
  | "filterByIconicTaxonUnknown"
  | "renderLocationPermissionsGate"
  | "requestLocationPermissions"
  | "updateTaxon"
  | "updateLocation"
  | "updateUser"
  | "updateProject"
> {
  showModal: boolean;
}

const ExploreFiltersModal = ( {
  showModal,
  closeModal,
  filterByIconicTaxonUnknown,
  renderLocationPermissionsGate,
  requestLocationPermissions,
  updateTaxon,
  updateLocation,
  updateUser,
  updateProject
}: Props ) => (
  <Modal
    showModal={showModal}
    fullScreen
    closeModal={closeModal}
    disableSwipeDirection
    modal={(
      <FilterModal
        closeModal={closeModal}
        filterByIconicTaxonUnknown={filterByIconicTaxonUnknown}
        renderLocationPermissionsGate={renderLocationPermissionsGate}
        requestLocationPermissions={requestLocationPermissions}
        updateTaxon={updateTaxon}
        updateLocation={updateLocation}
        updateUser={updateUser}
        updateProject={updateProject}
      />
    )}
  />
);

export default ExploreFiltersModal;
