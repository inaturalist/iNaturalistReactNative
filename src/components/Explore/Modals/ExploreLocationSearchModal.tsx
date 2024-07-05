import ExploreLocationSearch from "components/Explore/SearchScreens/ExploreLocationSearch";
import Modal from "components/SharedComponents/Modal.tsx";
import React from "react";

interface Props {
  showModal: boolean;
  closeModal: () => void;
  // TODO: Param not typed yet, because ExploreLocationSearch is not typed yet
  updateLocation: ( _location: any ) => void;
}

const ExploreLocationSearchModal = ( {
  showModal,
  closeModal,
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
        updateLocation={updateLocation}
      />
    )}
  />
);

export default ExploreLocationSearchModal;
