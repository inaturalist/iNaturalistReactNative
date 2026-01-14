import React from "react";
import type { SortItemType } from "types/sorting";

import RadioButtonSheet from "./RadioButtonSheet";

// TODO: add to translations
export const OBSERVATION_SORT_OPTIONS = {
  created_at_desc: {
    value: "created_at_desc",
    label: "Date Added: Newest (Default)",
    text: "Observations added recently appear first",
  },
  created_at_asc: {
    value: "created_at_asc",
    label: "Date Added: Oldest",
    text: "Observations added least recently appear first",
  },
  observed_at_desc: {
    value: "observed_at_desc",
    label: "Date Observed: Newest",
    text: "Observations with the most recent date appear first",
  },
  observed_at_asc: {
    value: "observed_at_asc",
    label: "Date Observed: Oldest",
    text: "Observations with the oldest date appear first",
  },
} as const;

export const TAXA_SORT_OPTIONS = {
  count_desc: {
    value: "count_desc",
    label: "Most Observed (Default)",
    text: "Species with the most observations appear first",
  },
  count_asc: {
    value: "count_asc",
    label: "Least Observed",
    text: "Species with the least observations appear first",
  },
} as const;

interface Props {
  itemType: SortItemType;
  selectedValue: string;
  onConfirm: ( sortBy: string ) => void;
  onPressClose: () => void;
}

const SortSheet = ( {
  itemType,
  selectedValue,
  onConfirm,
  onPressClose,
}: Props ) => {
  const radioValues = itemType === "observations"
    ? OBSERVATION_SORT_OPTIONS
    : TAXA_SORT_OPTIONS;

  // TODO: add to translations
  const headerText = itemType === "observations"
    ? "SORT OBSERVATIONS"
    : "SORT SPECIES";

  return (
    <RadioButtonSheet
      headerText={headerText}
      radioValues={radioValues}
      selectedValue={selectedValue}
      confirm={onConfirm}
      onPressClose={onPressClose}
    />
  );
};

export default SortSheet;
