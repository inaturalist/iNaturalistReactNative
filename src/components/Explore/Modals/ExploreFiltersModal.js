// @flow

import Modal from "components/SharedComponents/Modal";
import type { Node } from "react";
import React from "react";

import FilterModal from "./FilterModal";

type Props = {
    showModal: boolean,
    closeModal: Function,
    updateTaxon: Function,
  };

const ExploreFiltersModal = ( {
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
      <FilterModal
        closeModal={closeModal}
        updateTaxon={updateTaxon}
      />
    )}
  />
);

export default ExploreFiltersModal;
