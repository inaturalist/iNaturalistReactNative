import {
  RadioButtonSheet
} from "components/SharedComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

const SortBySheet = ( {
  handleClose,
  selectedValue,
  update
} ) => {
  const { t } = useTranslation( );

  const radioValues = {
    DATE_UPLOADED_NEWEST: {
      label: t( "Date-uploaded" ),
      text: t( "Newest-to-oldest" ),
      value: "DATE_UPLOADED_NEWEST"
    },
    DATE_UPLOADED_OLDEST: {
      label: t( "Date-uploaded" ),
      text: t( "Oldest-to-newest" ),
      value: "DATE_UPLOADED_OLDEST"
    },
    DATE_OBSERVED_NEWEST: {
      label: t( "Date-observed" ),
      text: t( "Newest-to-oldest" ),
      value: "DATE_OBSERVED_NEWEST"
    },
    DATE_OBSERVED_OLDEST: {
      label: t( "Date-observed" ),
      text: t( "Oldest-to-newest" ),
      value: "DATE_OBSERVED_OLDEST"
    },
    MOST_FAVED: {
      label: t( "Most-faved" ),
      value: "MOST_FAVED"
    }
  };

  return (
    <RadioButtonSheet
      headerText={t( "SORT-BY" )}
      confirm={newValue => {
        update( newValue );
        handleClose( );
      }}
      handleClose={handleClose}
      radioValues={radioValues}
      selectedValue={selectedValue}
    />
  );
};

export default SortBySheet;
