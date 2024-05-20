// @flow

import ExploreLocationSearch from "components/Explore/SearchScreens/ExploreLocationSearch";
import Modal from "components/SharedComponents/Modal";
import type { Node } from "react";
import React from "react";

interface Props {
  showModal: boolean,
  closeModal: Function,
  updateLocation: Function
}

const ExploreLocationSearchModal = ( {
  showModal,
  closeModal,
  updateLocation
}: Props ): Node => (
  <Modal
    showModal={showModal}
    fullScreen
    closeModal={closeModal}
    disableSwipeDirection
    modal={(
      <ExploreLocationSearch
        closeModal={closeModal}
        updateLocation={updateLocation}
      />
    )}
  />
);

export default ExploreLocationSearchModal;
