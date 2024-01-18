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
  updateTaxon: Function,
  numberOfFilters: number,
  updateSortBy: Function,
};

const ExploreFilters = ( {
  exploreParams,
  region,
  filtersNotDefault,
  resetFilters,
  showModal,
  closeModal,
  updateTaxon,
  updateSortBy,
  numberOfFilters
}: Props ): Node => (
  showModal && (
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
      numberOfFilters={numberOfFilters}
    />
  )
);

export default ExploreFilters;
