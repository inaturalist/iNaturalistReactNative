// @flow

import ExploreUserSearch from "components/Explore/SearchScreens/ExploreUserSearch";
import Modal from "components/SharedComponents/Modal.tsx";
import type { Node } from "react";
import React from "react";

interface Props {
  showModal: boolean,
  closeModal: Function,
  updateUser: Function
}

const ExploreUserSearchModal = ( {
  showModal,
  closeModal,
  updateUser
}: Props ): Node => (
  <Modal
    showModal={showModal}
    fullScreen
    closeModal={closeModal}
    disableSwipeDirection
    modal={(
      <ExploreUserSearch
        closeModal={closeModal}
        updateUser={updateUser}
      />
    )}
  />
);

export default ExploreUserSearchModal;
