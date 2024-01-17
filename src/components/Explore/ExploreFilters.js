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
  updateLowestTaxonomicRank: Function,
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
  updateResearchGrade,
  updateNeedsID,
  updateCasual,
  updateHighestTaxonomicRank,
  updateLowestTaxonomicRank,
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
      updateResearchGrade={updateResearchGrade}
      updateNeedsID={updateNeedsID}
      updateCasual={updateCasual}
      updateHighestTaxonomicRank={updateHighestTaxonomicRank}
      updateLowestTaxonomicRank={updateLowestTaxonomicRank}
      updateNative={updateNative}
      updateEndemic={updateEndemic}
      updateIntroduced={updateIntroduced}
      updateNoStatus={updateNoStatus}
    />
  )
);

export default ExploreFilters;
