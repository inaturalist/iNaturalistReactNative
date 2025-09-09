// @flow

import Modal from "components/SharedComponents/Modal";
import type { Node } from "react";
import React from "react";

import FilterModal from "./FilterModal";

type Props = {
  showModal: boolean,
  closeModal: Function,
  filterByIconicTaxonUnknown: Function,
  renderLocationPermissionsGate: Function,
  requestLocationPermissions: Function,
  updateTaxon: Function,
  updateLocation: Function,
  updateUser: Function,
  updateProject: Function
};

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
}: Props ): Node => (
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
