import type { Node } from "react";
import React from "react";

import FilterModal from "./Modals/FilterModal";

type Props = {
  showModal: boolean,
  closeModal: Function,
  updateTaxon: Function,
};

const ExploreFilters = ( {
  showModal,
  closeModal,
  updateTaxon
}: Props ): Node => (
  showModal && (
    <FilterModal
      closeModal={closeModal}
      updateTaxon={updateTaxon}
    />
  )
);

export default ExploreFilters;
