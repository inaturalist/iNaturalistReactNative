// @flow

import ExploreTaxonSearch from "components/Explore/SearchScreens/ExploreTaxonSearch";
import Modal from "components/SharedComponents/Modal";
import type { Node } from "react";
import React from "react";

type Props = {
    showModal: boolean,
    closeModal: Function,
    updateTaxon: Function,
  };

const ExploreTaxonSearchModal = ( {
  showModal,
  closeModal,
  updateTaxon
}: Props ): Node => (
  <Modal
    showModal={showModal}
    fullScreen
    closeModal={closeModal}
    disableSwipeDirection
    modal={(
      <ExploreTaxonSearch
        closeModal={closeModal}
        updateTaxon={updateTaxon}
      />
    )}
  />
);

export default ExploreTaxonSearchModal;
