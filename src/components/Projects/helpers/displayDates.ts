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

  if ( projectStartDate && !projectEndDate ) {
    projectDate = t( "project-start-time-datetime", {
      datetime: formatProjectsApiDatetimeLong( projectStartDate, i18n ),
    } );
  }
  if ( projectStartDate && projectEndDate ) {
    projectDate = t( "date-to-date", {
      d1: formatProjectsApiDatetimeLong( projectStartDate, i18n ),
      d2: formatProjectsApiDatetimeLong( projectEndDate, i18n ),
    } );
  }
  if ( observedOnDate ) {
    projectDate = formatProjectsApiDatetimeLong( observedOnDate, i18n );
  }
  if ( months ) {
    const monthList = months.split( "," );
    projectDate = monthList.map( numberOfMonth => monthValues[numberOfMonth].label ).join( ", " );
  }
  return {
    projectDate,
    shouldDisplayDateRange: projectStartDate && projectEndDate
      && project?.project_type !== "traditional",
  };
};

export default formatProjectDate;
