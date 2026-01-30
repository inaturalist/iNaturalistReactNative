import React from "react";
import { useTranslation } from "sharedHooks";
import type { SortItemType } from "types/sorting";

import { OBSERVATION_SORT_BY, SPECIES_SORT_BY } from "../../../types/sorting";
import RadioButtonSheet from "./RadioButtonSheet";

const getObservationSortOptions = ( t: ( key: string ) => string ) => ( {
  [OBSERVATION_SORT_BY.CREATED_AT_DESC]: {
    value: OBSERVATION_SORT_BY.CREATED_AT_DESC,
    label: t( "Date-Added-Newest-Default" ),
    text: t( "Observations-added-recently-appear-first" ),
  },
  [OBSERVATION_SORT_BY.CREATED_AT_ASC]: {
    value: OBSERVATION_SORT_BY.CREATED_AT_ASC,
    label: t( "Date-Added-Oldest" ),
    text: t( "Observations-added-least-recently-appear-first" ),
  },
  [OBSERVATION_SORT_BY.OBSERVED_AT_DESC]: {
    value: OBSERVATION_SORT_BY.OBSERVED_AT_DESC,
    label: t( "Date-Observed-Newest" ),
    text: t( "Observations-with-the-most-recent-date-appear-first" ),
  },
  [OBSERVATION_SORT_BY.OBSERVED_AT_ASC]: {
    value: OBSERVATION_SORT_BY.OBSERVED_AT_ASC,
    label: t( "Date-Observed-Oldest" ),
    text: t( "Observations-with-the-oldest-date-appear-first" ),
  },
} as const );

const getTaxaSortOptions = ( t: ( key: string ) => string ) => ( {
  [SPECIES_SORT_BY.COUNT_DESC]: {
    value: SPECIES_SORT_BY.COUNT_DESC,
    label: t( "Most-Observed-Default" ),
    text: t( "Species-with-the-most-observations-appear-first" ),
  },
  [SPECIES_SORT_BY.COUNT_ASC]: {
    value: SPECIES_SORT_BY.COUNT_ASC,
    label: t( "Least-Observed" ),
    text: t( "Species-with-the-least-observations-appear-first" ),
  },
} as const );

interface Props {
  itemType: SortItemType;
  selectedValue: SPECIES_SORT_BY;
  onConfirm: ( sortBy: string ) => void;
  onPressClose: () => void;
}

const SortSheet = ( {
  itemType,
  selectedValue,
  onConfirm,
  onPressClose,
}: Props ) => {
  const { t } = useTranslation( );

  const radioValues = itemType === "observations"
    ? getObservationSortOptions( t )
    : getTaxaSortOptions( t );

  const headerText = itemType === "observations"
    ? t( "SORT-OBSERVATIONS" )
    : t( "SORT-SPECIES" );

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
