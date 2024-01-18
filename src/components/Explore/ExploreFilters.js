import type { Node } from "react";
import React from "react";

import FilterModal from "./Modals/FilterModal";

type Props = {
  exploreParams: Object,
  region: Object,
  showModal: boolean,
  closeModal: Function,
  updateTaxon: Function,
};

const ExploreFilters = ( {
  exploreParams,
  region,
  showModal,
  closeModal,
  updateTaxon
}: Props ): Node => (
  showModal && (
    <FilterModal
      exploreFilters={{
        ...exploreParams,
        region
      }}
      closeModal={closeModal}
      updateTaxon={updateTaxon}
    />
  )
);

export default ExploreFilters;
