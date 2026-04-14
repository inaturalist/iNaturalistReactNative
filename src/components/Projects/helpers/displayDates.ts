import { formatProjectsApiDatetimeLong } from "sharedHelpers/dateAndTime";

const getFieldValue = item => item?.[0]?.value;

// https://github.com/inaturalist/inaturalist/blob/0994c85e2b87661042289ff080d3fc29ed8e70b3/app/webpack/projects/show/components/requirements.jsx#L100C3-L114C4
const formatProjectDate = ( project, t, i18n ) => {
  const monthValues = {
    1: {
      label: t( "January" ),
      value: 1,
    },
    2: {
      label: t( "February" ),
      value: 2,
    },
    3: {
      label: t( "March" ),
      value: 3,
    },
    4: {
      label: t( "April" ),
      value: 4,
    },
    5: {
      label: t( "May" ),
      value: 5,
    },
    6: {
      label: t( "June" ),
      value: 6,
    },
    7: {
      label: t( "July" ),
      value: 7,
    },
    8: {
      label: t( "August" ),
      value: 8,
    },
    9: {
      label: t( "September" ),
      value: 9,
    },
    10: {
      label: t( "October" ),
      value: 10,
    },
    11: {
      label: t( "November" ),
      value: 11,
    },
    12: {
      label: t( "December" ),
      value: 12,
    },
  };

  let projectDate = null;

  const projectStartDate = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "d1" ) );
  const projectEndDate = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "d2" ) );
  const observedOnDate = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "observed_on" ) );
  const months = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "month" ) );
  const formattedStartDate = projectStartDate
    ? formatProjectsApiDatetimeLong( projectStartDate, i18n, { missing: null } )
    : null;
  const formattedEndDate = projectEndDate
    ? formatProjectsApiDatetimeLong( projectEndDate, i18n, { missing: null } )
    : null;
  const formattedObservedOnDate = observedOnDate
    ? formatProjectsApiDatetimeLong( observedOnDate, i18n, { missing: null } )
    : null;

  if ( projectStartDate && !projectEndDate ) {
    projectDate = formattedStartDate
      ? t( "project-start-time-datetime", {
        datetime: formattedStartDate,
      } )
      : null;
  }
  if ( formattedStartDate && formattedEndDate ) {
    projectDate = t( "date-to-date", {
      d1: formattedStartDate,
      d2: formattedEndDate,
    } );
  }
  if ( formattedObservedOnDate ) {
    projectDate = formattedObservedOnDate;
  }
  if ( months ) {
    const monthList = months.split( "," );
    const monthLabels = monthList
      .map( numberOfMonth => monthValues[numberOfMonth]?.label )
      .filter( Boolean );
    projectDate = monthLabels.length > 0
      ? monthLabels.join( ", " )
      : null;
  }
  return {
    projectDate,
    shouldDisplayDateRange: !!( formattedStartDate && formattedEndDate )
      && project?.project_type !== "traditional",
  };
};

export default formatProjectDate;
