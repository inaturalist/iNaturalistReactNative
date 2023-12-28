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
  updateLowestTaxonomicRank: Function,
  updateDateObserved: Function,
  updateDateUploaded: Function,
  updateMedia: Function,
  updateNative: Function,
  updateEndemic: Function,
  updateIntroduced: Function,
  updateNoStatus: Function,
  updateWildStatus: Function,
  updateReviewed: Function
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
  updateDateObserved,
  updateDateUploaded,
  updateMedia,
  updateNative,
  updateEndemic,
  updateIntroduced,
  updateNoStatus,
  updateWildStatus,
  updateReviewed
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
        updateDateObserved={updateDateObserved}
        updateDateUploaded={updateDateUploaded}
        updateMedia={updateMedia}
        updateNative={updateNative}
        updateEndemic={updateEndemic}
        updateIntroduced={updateIntroduced}
        updateNoStatus={updateNoStatus}
        updateWildStatus={updateWildStatus}
        updateReviewed={updateReviewed}
      />
    )}
  />
);

export default ExploreFilters;
