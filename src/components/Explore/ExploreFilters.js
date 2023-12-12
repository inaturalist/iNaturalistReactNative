import Modal from "components/SharedComponents/Modal";
import type { Node } from "react";
import React from "react";

import FilterModal from "./Modals/FilterModal";

type Props = {
  exploreParams: Object,
  showModal: boolean,
  closeModal: Function,
  updateTaxon: Function
};

const ExploreFilters = ( {
  exploreParams,
  region,
  showModal,
  closeModal,
  updateTaxon,
  updateSortBy
}: Props ): Node => (
  <Modal
    showModal={showModal}
    closeModal={closeModal}
    fullScreen
    modal={(
      <FilterModal
        exploreFilters={{
          ...exploreParams,
          region
        }}
        closeModal={closeModal}
        updateTaxon={updateTaxon}
        updateSortBy={updateSortBy}
      />
    )}
  />
);

export default ExploreFilters;
