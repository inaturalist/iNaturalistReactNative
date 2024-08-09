import ExploreProjectSearch from "components/Explore/SearchScreens/ExploreProjectSearch";
import Modal from "components/SharedComponents/Modal.tsx";
import React from "react";

interface Props {
  showModal: boolean;
  closeModal: () => void;
  // TODO: Param not typed yet, because ExploreProjectSearch is not typed yet
  updateProject: ( project: null | { title: string } ) => void;
}

const ExploreProjectSearchModal = ( {
  showModal,
  closeModal,
  updateProject
}: Props ) => (
  <Modal
    showModal={showModal}
    fullScreen
    closeModal={closeModal}
    disableSwipeDirection
    modal={(
      <ExploreProjectSearch
        closeModal={closeModal}
        updateProject={updateProject}
      />
    )}
  />
);

export default ExploreProjectSearchModal;
