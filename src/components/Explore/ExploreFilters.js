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
  updateTaxon: Function,
  numberOfFilters: number,
  updateSortBy: Function,
  updateResearchGrade: Function,
  updateNeedsID: Function,
  updateCasual: Function,
  updateHighestTaxonomicRank: Function,
  updateLowestTaxonomicRank: Function
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
  updateResearchGrade,
  updateNeedsID,
  updateCasual,
  updateHighestTaxonomicRank,
  updateLowestTaxonomicRank
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
        numberOfFilters={numberOfFilters}
        updateResearchGrade={updateResearchGrade}
        updateNeedsID={updateNeedsID}
        updateCasual={updateCasual}
        updateHighestTaxonomicRank={updateHighestTaxonomicRank}
        updateLowestTaxonomicRank={updateLowestTaxonomicRank}
      />
    )}
  />
);

export default ExploreFilters;
