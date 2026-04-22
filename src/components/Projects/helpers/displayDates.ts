import type { ApiProject } from "api/types";
import type { i18n as i18next, TFunction } from "i18next";
import { formatProjectsApiDatetimeLong } from "sharedHelpers/dateAndTime";

interface ProjectRulePreference {
  field?: string;
  value?: string | null;
}

type ProjectWithDateRules = Omit<ApiProject, "project_type"> & {
  project_type?: ApiProject["project_type"];
  rule_preferences?: ProjectRulePreference[] | null;
};

interface FormattedProjectDate {
  projectDate: string | null;
  shouldDisplayDateRange: boolean;
}

const getFieldValue = ( item?: ProjectRulePreference[] | null ) => item?.[0]?.value ?? null;

// https://github.com/inaturalist/inaturalist/blob/0994c85e2b87661042289ff080d3fc29ed8e70b3/app/webpack/projects/show/components/requirements.jsx#L100C3-L114C4
const formatProjectDate = (
  project: ProjectWithDateRules | null | undefined,
  t: TFunction,
  i18n: i18next,
): FormattedProjectDate => {
  const monthValues: Record<string, string> = {
    1: t( "January" ),
    2: t( "February" ),
    3: t( "March" ),
    4: t( "April" ),
    5: t( "May" ),
    6: t( "June" ),
    7: t( "July" ),
    8: t( "August" ),
    9: t( "September" ),
    10: t( "October" ),
    11: t( "November" ),
    12: t( "December" ),
  };

  let projectDate: string | null = null;

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

  if ( formattedStartDate && !formattedEndDate ) {
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
      .map( numberOfMonth => monthValues[numberOfMonth] )
      .filter( ( label ): label is string => Boolean( label ) );
    projectDate = monthLabels.length > 0
      ? monthLabels.join( ", " )
      : null;
  }
  return {
    projectDate,
    shouldDisplayDateRange: !!( formattedStartDate && formattedEndDate )
      && project?.project_type !== "", // "" means "traditional"
  };
};

export default formatProjectDate;
