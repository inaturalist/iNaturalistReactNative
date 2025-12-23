import ExploreUserSearch from "components/Explore/SearchScreens/ExploreUserSearch";
import Modal from "components/SharedComponents/Modal";
import React from "react";

interface Props {
  showModal: boolean;
  closeModal: () => void;
  // TODO: Param not typed yet, because ExploreUserSearch is not typed yet
  updateUser: ( user: null | { login: string } ) => void;
}

const ExploreUserSearchModal = ( {
  showModal,
  closeModal,
  updateUser,
}: Props ) => (
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
