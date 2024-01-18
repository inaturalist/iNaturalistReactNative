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
  updateNative: Function,
  updateEndemic: Function,
  updateIntroduced: Function,
  updateNoStatus: Function,
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
  numberOfFilters,
  updateNative,
  updateEndemic,
  updateIntroduced,
  updateNoStatus
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
      updateNative={updateNative}
      updateEndemic={updateEndemic}
      updateIntroduced={updateIntroduced}
      updateNoStatus={updateNoStatus}
    />
  )
);

export default ExploreFilters;
