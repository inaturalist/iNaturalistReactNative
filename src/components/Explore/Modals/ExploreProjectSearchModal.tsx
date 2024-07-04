// @flow

import ExploreProjectSearch from "components/Explore/SearchScreens/ExploreProjectSearch";
import Modal from "components/SharedComponents/Modal.tsx";
import type { Node } from "react";
import React from "react";

interface Props {
  showModal: boolean,
  closeModal: Function,
  updateProject: Function
}

const ExploreProjectSearchModal = ( {
  showModal,
  closeModal,
  updateProject
}: Props ): Node => (
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
