import type { ApiProject } from "api/types";
import ExploreProjectSearch from "components/Explore/SearchScreens/ExploreProjectSearch";
import Modal from "components/SharedComponents/Modal";
import React from "react";

interface Props {
  showModal: boolean;
  closeModal: () => void;
  updateProject: ( project: ApiProject ) => void;
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
