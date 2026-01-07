import React from "react";

import RadioButtonSheet from "./RadioButtonSheet";

export type SortItemType = "observations" | "taxa";

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
  taxonomy: {
    value: "taxonomy",
    label: "Taxonomy",
    text: "Observations appear in taxonomic order",
  },
  name_asc: {
    value: "name_asc",
    label: "Alphabetical",
    text: "Observations appear in alphabetical order",
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
  taxonomy: {
    value: "taxonomy",
    label: "Taxonomy",
    text: "Species appear in taxonomic order",
  },
  name_asc: {
    value: "name_asc",
    label: "Alphabetical",
    text: "Species appear in alphabetical order",
  },
} as const;

interface Props {
  itemType: SortItemType;
  selectedValue: string;
  onConfirm: ( sortBy: string ) => void;
  onPressClose: () => void;
  insideModal?: boolean;
  testID?: string;

}

const SortSheet = ( {
  itemType,
  selectedValue,
  onConfirm,
  onPressClose,
  insideModal,
  testID,
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
      insideModal={insideModal}
      testID={testID}
    />
  );
};

export default SortSheet;
