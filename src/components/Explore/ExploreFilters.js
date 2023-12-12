import Modal from "components/SharedComponents/Modal";
import type { Node } from "react";
import React from "react";

import FilterModal from "./Modals/FilterModal";

type Props = {
  exploreParams: Object,
  region: Object,
  filtersNotDefault: boolean,
  resetFilters: Function,
  showModal: boolean,
  closeModal: Function,
  updateTaxon: Function
};

const ExploreFilters = ( {
  exploreParams,
  region,
  filtersNotDefault,
  resetFilters,
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
        filtersNotDefault={filtersNotDefault}
        resetFilters={resetFilters}
        closeModal={closeModal}
        updateTaxon={updateTaxon}
        updateSortBy={updateSortBy}
      />
    )}
  />
);

export default ExploreFilters;
