import React from "react";
import { useTranslation } from "sharedHooks";
import type { SortItemType } from "types/sorting";

import RadioButtonSheet from "./RadioButtonSheet";

const getObservationSortOptions = ( t: ( key: string ) => string ) => ( {
  created_at_desc: {
    value: "created_at_desc",
    label: t( "Date-Added-Newest-Default" ),
    text: t( "Observations-added-recently-appear-first" ),
  },
  created_at_asc: {
    value: "created_at_asc",
    label: t( "Date-Added-Oldest" ),
    text: t( "Observations-added-least-recently-appear-first" ),
  },
  observed_at_desc: {
    value: "observed_at_desc",
    label: t( "Date-Observed-Newest" ),
    text: t( "Observations-with-the-most-recent-date-appear-first" ),
  },
  observed_at_asc: {
    value: "observed_at_asc",
    label: t( "Date-Observed-Oldest" ),
    text: t( "Observations-with-the-oldest-date-appear-first" ),
  },
} as const );

const getTaxaSortOptions = ( t: ( key: string ) => string ) => ( {
  count_desc: {
    value: "count_desc",
    label: t( "Most-Observed-Default" ),
    text: t( "Species-with-the-most-observations-appear-first" ),
  },
  count_asc: {
    value: "count_asc",
    label: t( "Least-Observed" ),
    text: t( "Species-with-the-least-observations-appear-first" ),
  },
} as const );

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
